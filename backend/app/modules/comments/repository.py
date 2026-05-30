from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.comments.model import Comment
from app.modules.comments.schema import CommentCreate, CommentUpdate


class CommentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, comment_id: int) -> Comment | None:
        statement = select(Comment).where(Comment.id == comment_id)
        return self.db.scalar(statement)

    def list_public_by_project(self, project_id: int) -> list[Comment]:
        statement = (
            select(Comment)
            .where(
                Comment.project_id == project_id,
                Comment.is_hidden.is_(False),
            )
            .order_by(Comment.created_at.asc(), Comment.id.asc())
        )
        return list(self.db.scalars(statement).all())

    def list_all_by_project(self, project_id: int) -> list[Comment]:
        statement = (
            select(Comment)
            .where(Comment.project_id == project_id)
            .order_by(Comment.created_at.asc(), Comment.id.asc())
        )
        return list(self.db.scalars(statement).all())

    def create(self, *, project_id: int, user_id: int, data: CommentCreate) -> Comment:
        comment = Comment(
            project_id=project_id,
            user_id=user_id,
            parent_id=data.parent_id,
            text=data.text,
        )

        self.db.add(comment)
        self.db.flush()
        self.db.refresh(comment)

        return comment

    def update(self, comment: Comment, data: CommentUpdate) -> Comment:
        comment.text = data.text

        self.db.add(comment)
        self.db.flush()
        self.db.refresh(comment)

        return comment

    def moderate(
        self,
        *,
        comment: Comment,
        is_hidden: bool,
        hidden_reason: str | None,
    ) -> Comment:
        comment.is_hidden = is_hidden
        comment.hidden_reason = hidden_reason if is_hidden else None

        self.db.add(comment)
        self.db.flush()
        self.db.refresh(comment)

        return comment
