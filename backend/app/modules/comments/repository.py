from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.comments.model import Comment
from app.modules.comments.schema import CommentCreate, CommentUpdate


class CommentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, comment_id: int) -> Comment | None:
        statement = select(Comment).where(Comment.id == comment_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_public_by_project(self, project_id: int) -> list[Comment]:
        statement = (
            select(Comment)
            .where(
                Comment.project_id == project_id,
                Comment.is_hidden.is_(False),
            )
            .order_by(Comment.created_at.asc(), Comment.id.asc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_all_by_project(self, project_id: int) -> list[Comment]:
        statement = (
            select(Comment)
            .where(Comment.project_id == project_id)
            .order_by(Comment.created_at.asc(), Comment.id.asc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create(self, *, project_id: int, user_id: int, data: CommentCreate) -> Comment:
        comment = Comment(
            project_id=project_id,
            user_id=user_id,
            parent_id=data.parent_id,
            text=data.text,
        )

        self.db.add(comment)
        await self.db.flush()
        await self.db.refresh(comment)

        return comment

    async def update(self, comment: Comment, data: CommentUpdate) -> Comment:
        comment.text = data.text

        self.db.add(comment)
        await self.db.flush()
        await self.db.refresh(comment)

        return comment

    async def moderate(
        self,
        *,
        comment: Comment,
        is_hidden: bool,
        hidden_reason: str | None,
    ) -> Comment:
        comment.is_hidden = is_hidden
        comment.hidden_reason = hidden_reason if is_hidden else None

        self.db.add(comment)
        await self.db.flush()
        await self.db.refresh(comment)

        return comment
