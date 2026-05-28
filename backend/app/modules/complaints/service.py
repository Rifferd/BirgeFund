from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.comments.repository import CommentRepository
from app.modules.complaints.model import Complaint
from app.modules.complaints.repository import ComplaintRepository
from app.modules.complaints.schema import ComplaintCreate
from app.modules.projects.repository import ProjectRepository
from app.modules.users.model import User
from app.shared.enums import ProjectStatus


PUBLIC_PROJECT_STATUSES = {
    ProjectStatus.FUNDRAISING,
    ProjectStatus.FUNDED,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.COMPLETED,
}


class ComplaintService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.complaints = ComplaintRepository(db)
        self.projects = ProjectRepository(db)
        self.comments = CommentRepository(db)

    def create(self, *, current_user: User, data: ComplaintCreate) -> Complaint:
        project = self.projects.get_by_id(data.project_id)

        if project is None or project.status not in PUBLIC_PROJECT_STATUSES:
            raise NotFoundException("Проект не найден")

        if data.comment_id is not None:
            comment = self.comments.get_by_id(data.comment_id)

            if comment is None or comment.project_id != data.project_id:
                raise BadRequestException("Комментарий не относится к этому проекту")

        complaint = self.complaints.create(
            reporter_id=current_user.id,
            data=data,
        )

        self.db.commit()
        self.db.refresh(complaint)

        return complaint

    def list_my(self, current_user: User) -> list[Complaint]:
        return self.complaints.list_my(current_user.id)

    def list_by_project(self, project_id: int) -> list[Complaint]:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return self.complaints.list_by_project(project_id)

    def list_open(self) -> list[Complaint]:
        return self.complaints.list_open()
