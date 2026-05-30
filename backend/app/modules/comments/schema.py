from datetime import datetime

from pydantic import Field

from app.shared.schemas import BaseSchema


class CommentCreate(BaseSchema):
    text: str = Field(min_length=2, max_length=3000)
    parent_id: int | None = None


class CommentUpdate(BaseSchema):
    text: str = Field(min_length=2, max_length=3000)


class CommentModerationRequest(BaseSchema):
    is_hidden: bool
    hidden_reason: str | None = Field(default=None, max_length=1000)


class CommentRead(BaseSchema):
    id: int
    project_id: int
    user_id: int
    parent_id: int | None
    text: str
    is_hidden: bool
    hidden_reason: str | None
    created_at: datetime
    updated_at: datetime | None
