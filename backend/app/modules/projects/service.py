from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
    PermissionDeniedException,
)
from app.modules.audit.service import AuditLogService
from app.modules.ledger.service import LedgerService
from app.modules.projects.model import Project, ProjectUpdateItem
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.schema import (
    ProjectCreate,
    ProjectTranslationCreate,
    ProjectUpdate,
    ProjectUpdateItemCreate,
)
from app.modules.users.model import User
from app.shared.enums import ProjectStatus, ProjectType


ALLOWED_PROJECT_STATUS_TRANSITIONS: dict[ProjectStatus, set[ProjectStatus]] = {
    ProjectStatus.DRAFT: {ProjectStatus.PENDING_REVIEW},
    ProjectStatus.PENDING_REVIEW: {ProjectStatus.APPROVED, ProjectStatus.REJECTED},
    ProjectStatus.REJECTED: {ProjectStatus.DRAFT},
    ProjectStatus.APPROVED: {ProjectStatus.FUNDRAISING},
    ProjectStatus.FUNDRAISING: {
        ProjectStatus.FUNDED,
        ProjectStatus.FAILED,
        ProjectStatus.CANCELLED,
        ProjectStatus.FROZEN,
    },
    ProjectStatus.FROZEN: {ProjectStatus.FUNDRAISING, ProjectStatus.CANCELLED},
    ProjectStatus.FUNDED: {ProjectStatus.IN_PROGRESS},
    ProjectStatus.IN_PROGRESS: {ProjectStatus.COMPLETED, ProjectStatus.FROZEN},
    ProjectStatus.COMPLETED: set(),
    ProjectStatus.FAILED: set(),
    ProjectStatus.CANCELLED: set(),
}


class ProjectStatusService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.projects = ProjectRepository(db)
        self.audit = AuditLogService(db)

    async def change_status(
        self,
        *,
        project: Project,
        new_status: ProjectStatus,
        actor: User,
        reason: str | None = None,
    ) -> Project:
        old_status = project.status

        if old_status == new_status:
            raise BadRequestException("Проект уже находится в этом статусе")

        allowed_targets = ALLOWED_PROJECT_STATUS_TRANSITIONS.get(old_status, set())

        if new_status not in allowed_targets:
            raise BadRequestException(
                f"Переход статуса {old_status.value} -> {new_status.value} запрещён"
            )

        self._validate_status_reason(new_status=new_status, reason=reason)

        project.status = new_status
        self._apply_status_side_effects(project=project, new_status=new_status, reason=reason)

        project = await self.projects.save(project)

        await self.audit.log_project_status_change(
            project_id=project.id,
            old_status=old_status.value,
            new_status=new_status.value,
            actor=actor,
            reason=reason,
        )

        await self.db.commit()
        await self.db.refresh(project)

        return project

    def _validate_status_reason(self, *, new_status: ProjectStatus, reason: str | None) -> None:
        statuses_that_require_reason = {
            ProjectStatus.REJECTED,
            ProjectStatus.FROZEN,
            ProjectStatus.CANCELLED,
            ProjectStatus.FAILED,
        }

        if new_status in statuses_that_require_reason and not reason:
            raise BadRequestException("Для этого статуса нужно указать причину")

    def _apply_status_side_effects(
        self,
        *,
        project: Project,
        new_status: ProjectStatus,
        reason: str | None,
    ) -> None:
        now = datetime.now(UTC)

        if new_status == ProjectStatus.PENDING_REVIEW:
            project.submitted_at = now
            project.rejection_reason = None

        if new_status == ProjectStatus.REJECTED:
            project.rejection_reason = reason

        if new_status == ProjectStatus.APPROVED:
            project.approved_at = now
            project.rejection_reason = None

        if new_status == ProjectStatus.FUNDRAISING and project.published_at is None:
            project.published_at = now

        if new_status == ProjectStatus.FROZEN:
            project.frozen_reason = reason

        if new_status != ProjectStatus.FROZEN:
            project.frozen_reason = None


class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.projects = ProjectRepository(db)
        self.status_service = ProjectStatusService(db)
        self.ledger = LedgerService(db)

    async def attach_ledger_summary(self, project: Project) -> Project:
        summary = await self.ledger.get_project_summary(project.id)

        project.gross_collected = summary.gross_collected
        project.net_amount = summary.net_amount
        project.platform_fee_amount = summary.platform_fee_amount
        project.refunded_amount = summary.refunded_amount

        if project.goal_amount > 0:
            progress = int((summary.gross_collected / project.goal_amount) * 100)
            project.progress_percent = min(progress, 100)
        else:
            project.progress_percent = 0

        return project

    async def attach_ledger_summary_to_list(self, projects: list[Project]) -> list[Project]:
        return [await self.attach_ledger_summary(project) for project in projects]

    async def list_public(self) -> list[Project]:
        projects = await self.projects.list_public()
        return await self.attach_ledger_summary_to_list(projects)

    async def list_my_projects(self, current_user: User) -> list[Project]:
        projects = await self.projects.list_by_author(current_user.id)
        return await self.attach_ledger_summary_to_list(projects)

    async def get_by_slug(self, slug: str) -> Project:
        project = await self.projects.get_by_slug(slug)

        if project is None:
            raise NotFoundException("Проект не найден")

        return await self.attach_ledger_summary(project)

    async def get_by_id(self, project_id: int) -> Project:
        project = await self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return await self.attach_ledger_summary(project)

    async def create_draft(self, current_user: User, data: ProjectCreate) -> Project:
        if data.project_type == ProjectType.INVESTMENT_DISABLED:
            raise BadRequestException("Инвестиционные проекты отключены в demo-версии")

        if await self.projects.get_by_slug(data.slug) is not None:
            raise ConflictException("Проект с таким slug уже существует")

        self._validate_translations(data.translations)

        project = await self.projects.create_draft(
            author_id=current_user.id,
            data=data,
        )

        await self.db.commit()
        await self.db.refresh(project)

        return await self.attach_ledger_summary(project)

    async def update_draft(self, project_id: int, current_user: User, data: ProjectUpdate) -> Project:
        project = await self.get_by_id(project_id)

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно редактировать только свои проекты")

        if project.status not in [ProjectStatus.DRAFT, ProjectStatus.REJECTED]:
            raise BadRequestException("Можно редактировать только черновик или отклонённый проект")

        if data.project_type == ProjectType.INVESTMENT_DISABLED:
            raise BadRequestException("Инвестиционные проекты отключены в demo-версии")

        if data.slug is not None:
            existing_project = await self.projects.get_by_slug(data.slug)
            if existing_project is not None and existing_project.id != project.id:
                raise ConflictException("Проект с таким slug уже существует")

        if data.translations is not None:
            self._validate_translations(data.translations)

        project = await self.projects.update_project(project, data)

        await self.db.commit()
        await self.db.refresh(project)

        return await self.attach_ledger_summary(project)

    async def submit_to_review(self, project_id: int, current_user: User) -> Project:
        project = await self.get_by_id(project_id)

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно отправлять на модерацию только свои проекты")

        self._validate_project_ready_for_review(project)

        project = await self.status_service.change_status(
            project=project,
            new_status=ProjectStatus.PENDING_REVIEW,
            actor=current_user,
            reason="Автор отправил проект на модерацию",
        )

        return await self.attach_ledger_summary(project)

    async def change_status(
        self,
        *,
        project_id: int,
        new_status: ProjectStatus,
        current_user: User,
        reason: str | None = None,
    ) -> Project:
        project = await self.get_by_id(project_id)

        project = await self.status_service.change_status(
            project=project,
            new_status=new_status,
            actor=current_user,
            reason=reason,
        )

        return await self.attach_ledger_summary(project)

    async def list_public_updates(self, project_id: int) -> list[ProjectUpdateItem]:
        project = await self.get_by_id(project_id)

        public_statuses = {
            ProjectStatus.FUNDRAISING,
            ProjectStatus.FUNDED,
            ProjectStatus.IN_PROGRESS,
            ProjectStatus.COMPLETED,
        }

        if project.status not in public_statuses:
            raise NotFoundException("Проект не найден")

        return await self.projects.list_public_updates(project_id)

    async def list_my_project_updates(
        self,
        project_id: int,
        current_user: User,
    ) -> list[ProjectUpdateItem]:
        project = await self.get_by_id(project_id)

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно смотреть только новости своих проектов")

        return await self.projects.list_updates_for_author(project_id)

    async def create_update(
        self,
        *,
        project_id: int,
        current_user: User,
        data: ProjectUpdateItemCreate,
    ) -> ProjectUpdateItem:
        project = await self.get_by_id(project_id)

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно добавлять новости только к своим проектам")

        if project.status in [ProjectStatus.CANCELLED, ProjectStatus.FAILED]:
            raise BadRequestException("Нельзя добавлять новости к отменённому или проваленному проекту")

        project_update = await self.projects.create_update(
            project_id=project.id,
            author_id=current_user.id,
            language=data.language,
            title=data.title,
            text=data.text,
            is_public=data.is_public,
        )

        await self.db.commit()
        await self.db.refresh(project_update)

        return project_update

    def _validate_project_ready_for_review(self, project: Project) -> None:
        if project.project_type == ProjectType.INVESTMENT_DISABLED:
            raise BadRequestException("Инвестиционные проекты отключены в demo-версии")

        if project.goal_amount <= 0:
            raise BadRequestException("Цель сбора должна быть больше нуля")

        if not project.translations:
            raise BadRequestException("Нужно добавить хотя бы один перевод проекта")

        languages = [translation.language for translation in project.translations]

        if "ru" not in languages:
            raise BadRequestException("Русский перевод обязателен")

        for translation in project.translations:
            if not translation.title.strip():
                raise BadRequestException("Название проекта обязательно")

            if not translation.short_description.strip():
                raise BadRequestException("Короткое описание проекта обязательно")

            if not translation.description.strip():
                raise BadRequestException("Описание проекта обязательно")

    def _validate_translations(self, translations: list[ProjectTranslationCreate]) -> None:
        languages = [translation.language for translation in translations]

        if "ru" not in languages:
            raise BadRequestException("Русский перевод обязателен")

        if len(languages) != len(set(languages)):
            raise BadRequestException("Нельзя добавлять два перевода на одном языке")
