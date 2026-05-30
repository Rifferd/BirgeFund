from sqlalchemy.ext.asyncio import AsyncSession

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
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.comments = CommentRepository(db)
        self.projects = ProjectRepository(db)

    async def list_public_by_project(self, project_id: int) -> list[Comment]:
        project = await self.projects.get_by_id(project_id)

        if project is None or project.status not in PUBLIC_PROJECT_STATUSES:
            raise NotFoundException("Проект не найден")

        return await self.comments.list_public_by_project(project_id)

    async def list_all_by_project(self, project_id: int) -> list[Comment]:
        project = await self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return await self.comments.list_all_by_project(project_id)

    async def create(self, *, project_id: int, current_user: User, data: CommentCreate) -> Comment:
        project = await self.projects.get_by_id(project_id)

        if project is None or project.status not in PUBLIC_PROJECT_STATUSES:
            raise NotFoundException("Проект не найден")

        if data.parent_id is not None:
            parent = await self.comments.get_by_id(data.parent_id)

            if parent is None or parent.project_id != project_id:
                raise BadRequestException("Родительский комментарий не найден")

            if parent.is_hidden:
                raise BadRequestException("Нельзя отвечать на скрытый комментарий")

        comment = await self.comments.create(
            project_id=project_id,
            user_id=current_user.id,
            data=data,
        )

        await self.db.commit()
        await self.db.refresh(comment)

        return comment

    async def update(self, *, comment_id: int, current_user: User, data: CommentUpdate) -> Comment:
        comment = await self._get_comment(comment_id)

        if comment.user_id != current_user.id:
            raise PermissionDeniedException("Можно редактировать только свои комментарии")

        if comment.is_hidden:
            raise BadRequestException("Скрытый комментарий нельзя редактировать")

        comment = await self.comments.update(comment, data)

        await self.db.commit()
        await self.db.refresh(comment)

        return comment

    async def moderate(self, *, comment_id: int, data: CommentModerationRequest) -> Comment:
        comment = await self._get_comment(comment_id)

        if data.is_hidden and not data.hidden_reason:
            raise BadRequestException("Для скрытия комментария нужно указать причину")

        comment = await self.comments.moderate(
            comment=comment,
            is_hidden=data.is_hidden,
            hidden_reason=data.hidden_reason,
        )

        await self.db.commit()
        await self.db.refresh(comment)

        return comment

    async def _get_comment(self, comment_id: int) -> Comment:
        comment = await self.comments.get_by_id(comment_id)

        if comment is None:
            raise NotFoundException("Комментарий не найден")

        return comment
