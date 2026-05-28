from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.shared.enums import ReportStatus
from app.shared.schemas import BaseSchema


class ProjectReportCreate(BaseSchema):
    language: str = Field(default="ru", max_length=10)
    title: str = Field(min_length=3, max_length=255)
    text: str = Field(min_length=10)
    expense_amount: Decimal | None = Field(default=None, ge=0)


class ProjectReportUpdate(BaseSchema):
    language: str | None = Field(default=None, max_length=10)
    title: str | None = Field(default=None, min_length=3, max_length=255)
    text: str | None = Field(default=None, min_length=10)
    expense_amount: Decimal | None = Field(default=None, ge=0)


class ProjectReportModerationRequest(BaseSchema):
    status: ReportStatus
    moderator_comment: str | None = Field(default=None, max_length=1000)


class ProjectReportRead(BaseSchema):
    id: int
    project_id: int
    author_id: int
    language: str
    title: str
    text: str
    expense_amount: Decimal | None
    status: ReportStatus
    moderator_comment: str | None
    created_at: datetime
    updated_at: datetime | None
    submitted_at: datetime | None
    reviewed_at: datetime | None
