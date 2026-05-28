from datetime import datetime

from pydantic import Field

from app.shared.enums import ComplaintReason, ComplaintStatus
from app.shared.schemas import BaseSchema


class ComplaintCreate(BaseSchema):
    project_id: int
    comment_id: int | None = None
    reason: ComplaintReason
    text: str = Field(min_length=5, max_length=3000)


class ComplaintModerationRequest(BaseSchema):
    status: ComplaintStatus
    moderator_comment: str | None = Field(default=None, max_length=1000)


class ComplaintRead(BaseSchema):
    id: int
    reporter_id: int
    project_id: int
    comment_id: int | None
    reason: ComplaintReason
    text: str
    status: ComplaintStatus
    moderator_id: int | None
    moderator_comment: str | None
    created_at: datetime
    reviewed_at: datetime | None
