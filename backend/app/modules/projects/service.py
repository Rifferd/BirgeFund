from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException, PermissionDeniedException
from app.modules.projects.model import Project
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.schema import ProjectCreate, ProjectUpdate
from app.modules.users.model import User
from app.shared.enums import ProjectStatus, ProjectType


class ProjectService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.projects = ProjectRepository(db)

    def list_public(self) -> list[Project]:
        return self.projects.list_public()

    def list_my_projects(self, current_user: User) -> list[Project]:
        return self.projects.list_by_author(current_user.id)

    def get_by_slug(self, slug: str) -> Project:
        project = self.projects.get_by_slug(slug)

        if project is None:
            raise NotFoundException("Проект не найден")

        return project

    def get_by_id(self, project_id: int) -> Project:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return project

    def create_draft(self, current_user: User, data: ProjectCreate) -> Project:
        if data.project_type == ProjectType.INVESTMENT_DISABLED:
            raise BadRequestException("Инвестиционные проекты отключены в demo-версии")

        if self.projects.get_by_slug(data.slug) is not None:
            raise ConflictException("Проект с таким slug уже существует")

        self._validate_translations(data.translations)

        project = self.projects.create_draft(
            author_id=current_user.id,
            data=data,
        )

        self.db.commit()
        self.db.refresh(project)

        return project

    def update_draft(self, project_id: int, current_user: User, data: ProjectUpdate) -> Project:
        project = self.get_by_id(project_id)

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно редактировать только свои проекты")

        if project.status not in [ProjectStatus.DRAFT, ProjectStatus.REJECTED]:
            raise BadRequestException("Можно редактировать только черновик или отклонённый проект")

        if data.project_type == ProjectType.INVESTMENT_DISABLED:
            raise BadRequestException("Инвестиционные проекты отключены в demo-версии")

        if data.slug is not None:
            existing_project = self.projects.get_by_slug(data.slug)
            if existing_project is not None and existing_project.id != project.id:
                raise ConflictException("Проект с таким slug уже существует")

        if data.translations is not None:
            self._validate_translations(data.translations)

        project = self.projects.update_project(project, data)

        self.db.commit()
        self.db.refresh(project)

        return project

    def _validate_translations(self, translations: list) -> None:
        languages = [translation.language for translation in translations]

        if "ru" not in languages:
            raise BadRequestException("Русский перевод обязателен")

        if len(languages) != len(set(languages)):
            raise BadRequestException("Нельзя добавлять два перевода на одном языке")
