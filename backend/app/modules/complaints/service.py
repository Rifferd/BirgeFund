from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.audit.service import AuditLogService
from app.modules.comments.repository import CommentRepository
from app.modules.complaints.model import Complaint
from app.modules.complaints.repository import ComplaintRepository
from app.modules.complaints.schema import ComplaintCreate, ComplaintModerationRequest
from app.modules.projects.repository import ProjectRepository
from app.modules.users.model import User
from app.shared.enums import ComplaintStatus, ProjectStatus


PUBLIC_PROJECT_STATUSES = {
    ProjectStatus.FUNDRAISING,
    ProjectStatus.FUNDED,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.COMPLETED,
}


class ComplaintAuditActions:
    COMPLAINT_CREATED = "complaint.created"
    COMPLAINT_STATUS_CHANGED = "complaint.status_changed"


class ComplaintService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.complaints = ComplaintRepository(db)
        self.projects = ProjectRepository(db)
        self.comments = CommentRepository(db)
        self.audit = AuditLogService(db)

    async def create(self, *, current_user: User, data: ComplaintCreate) -> Complaint:
        project = await self.projects.get_by_id(data.project_id)

        if project is None or project.status not in PUBLIC_PROJECT_STATUSES:
            raise NotFoundException("Проект не найден")

        if data.comment_id is not None:
            comment = await self.comments.get_by_id(data.comment_id)

            if comment is None or comment.project_id != data.project_id:
                raise BadRequestException("Комментарий не относится к этому проекту")

        complaint = await self.complaints.create(
            reporter_id=current_user.id,
            data=data,
        )

        await self.audit.create_log(
            action=ComplaintAuditActions.COMPLAINT_CREATED,
            entity_type="complaint",
            entity_id=complaint.id,
            actor=current_user,
            new_values={
                "project_id": complaint.project_id,
                "comment_id": complaint.comment_id,
                "reason": complaint.reason.value,
                "status": complaint.status.value,
            },
        )

        await self.db.commit()
        await self.db.refresh(complaint)

        return complaint

    async def list_all(self, status: ComplaintStatus | None = None) -> list[Complaint]:
        if status is None:
            return await self.complaints.list_all()

        return await self.complaints.list_by_status(status)

    async def list_my(self, current_user: User) -> list[Complaint]:
        return await self.complaints.list_my(current_user.id)

    async def list_by_project(self, project_id: int) -> list[Complaint]:
        project = await self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return await self.complaints.list_by_project(project_id)

    async def list_open(self) -> list[Complaint]:
        return await self.complaints.list_open()

    async def moderate(
        self,
        *,
        complaint_id: int,
        current_user: User,
        data: ComplaintModerationRequest,
    ) -> Complaint:
        complaint = await self._get_complaint(complaint_id)
        old_status = complaint.status

        if old_status in {ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED}:
            raise BadRequestException("Закрытую жалобу нельзя изменить")

        if data.status == ComplaintStatus.OPEN:
            raise BadRequestException("Нельзя вернуть жалобу в статус open")

        if data.status in {ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED} and not data.moderator_comment:
            raise BadRequestException("Для закрытия жалобы нужен комментарий модератора")

        complaint = await self.complaints.moderate(
            complaint=complaint,
            status=data.status,
            moderator_id=current_user.id,
            moderator_comment=data.moderator_comment,
        )

        if data.status == ComplaintStatus.RESOLVED and complaint.comment_id is not None:
            comment = await self.comments.get_by_id(complaint.comment_id)

            if comment is not None and not comment.is_hidden:
                await self.comments.moderate(
                    comment=comment,
                    is_hidden=True,
                    hidden_reason=data.moderator_comment or "Комментарий скрыт по жалобе",
                )

        await self.audit.create_log(
            action=ComplaintAuditActions.COMPLAINT_STATUS_CHANGED,
            entity_type="complaint",
            entity_id=complaint.id,
            actor=current_user,
            old_values={"status": old_status.value},
            new_values={
                "status": complaint.status.value,
                "moderator_comment": complaint.moderator_comment,
                "moderator_id": complaint.moderator_id,
            },
        )

        await self.db.commit()
        await self.db.refresh(complaint)

        return complaint

    async def _get_complaint(self, complaint_id: int) -> Complaint:
        complaint = await self.complaints.get_by_id(complaint_id)

        if complaint is None:
            raise NotFoundException("Жалоба не найдена")

        return complaint
