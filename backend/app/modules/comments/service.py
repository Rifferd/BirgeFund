from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException, PermissionDeniedException
from app.modules.comments.model import Comment
from app.modules.comments.repository import CommentRepository
from app.modules.comments.schema import CommentCreate, CommentModerationRequest, CommentUpdate
from app.modules.projects.repository import ProjectRepository
from app.modules.users.model import User
from app.shared.enums import ProjectStatus


PUBLIC_PROJECT_STATUSES = {
    ProjectStatus.FUNDRAISING,
    ProjectStatus.FUNDED,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.COMPLETED,
}


class CommentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.comments = CommentRepository(db)
        self.projects = ProjectRepository(db)

    def list_public_by_project(self, project_id: int) -> list[Comment]:
        project = self.projects.get_by_id(project_id)

        if project is None or project.status not in PUBLIC_PROJECT_STATUSES:
            raise NotFoundException("Проект не найден")

        return self.comments.list_public_by_project(project_id)

    def list_all_by_project(self, project_id: int) -> list[Comment]:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return self.comments.list_all_by_project(project_id)

    def create(self, *, project_id: int, current_user: User, data: CommentCreate) -> Comment:
        project = self.projects.get_by_id(project_id)

        if project is None or project.status not in PUBLIC_PROJECT_STATUSES:
            raise NotFoundException("Проект не найден")

        if data.parent_id is not None:
            parent = self.comments.get_by_id(data.parent_id)

            if parent is None or parent.project_id != project_id:
                raise BadRequestException("Родительский комментарий не найден")

            if parent.is_hidden:
                raise BadRequestException("Нельзя отвечать на скрытый комментарий")

        comment = self.comments.create(
            project_id=project_id,
            user_id=current_user.id,
            data=data,
        )

        self.db.commit()
        self.db.refresh(comment)

        return comment

    def update(self, *, comment_id: int, current_user: User, data: CommentUpdate) -> Comment:
        comment = self._get_comment(comment_id)

        if comment.user_id != current_user.id:
            raise PermissionDeniedException("Можно редактировать только свои комментарии")

        if comment.is_hidden:
            raise BadRequestException("Скрытый комментарий нельзя редактировать")

        comment = self.comments.update(comment, data)

        self.db.commit()
        self.db.refresh(comment)

        return comment

    def moderate(self, *, comment_id: int, data: CommentModerationRequest) -> Comment:
        comment = self._get_comment(comment_id)

        if data.is_hidden and not data.hidden_reason:
            raise BadRequestException("Для скрытия комментария нужно указать причину")

        comment = self.comments.moderate(
            comment=comment,
            is_hidden=data.is_hidden,
            hidden_reason=data.hidden_reason,
        )

        self.db.commit()
        self.db.refresh(comment)

        return comment

    def _get_comment(self, comment_id: int) -> Comment:
        comment = self.comments.get_by_id(comment_id)

        if comment is None:
            raise NotFoundException("Комментарий не найден")

        return comment
