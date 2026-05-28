from datetime import date, datetime
from decimal import Decimal

from pydantic import Field

from app.shared.enums import FundingType, ProjectStatus, ProjectType
from app.shared.schemas import BaseSchema


class ProjectTranslationBase(BaseSchema):
    language: str = Field(max_length=10)
    title: str = Field(min_length=3, max_length=255)
    short_description: str = Field(min_length=10, max_length=500)
    description: str = Field(min_length=20)
    risks: str | None = None
    refund_policy: str | None = None
    reward_description: str | None = None
    report_text: str | None = None


class ProjectTranslationCreate(ProjectTranslationBase):
    pass


class ProjectTranslationRead(ProjectTranslationBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime | None


class ProjectBase(BaseSchema):
    slug: str = Field(min_length=3, max_length=255)
    project_type: ProjectType
    funding_type: FundingType = FundingType.ALL_OR_NOTHING
    city: str | None = Field(default=None, max_length=120)
    goal_amount: Decimal = Field(gt=0)
    currency: str = Field(default="KGS", max_length=3)
    deadline: date | None = None


class ProjectCreate(ProjectBase):
    category_ids: list[int] = Field(default_factory=list)
    translations: list[ProjectTranslationCreate] = Field(min_length=1)


class ProjectUpdate(BaseSchema):
    slug: str | None = Field(default=None, min_length=3, max_length=255)
    project_type: ProjectType | None = None
    funding_type: FundingType | None = None
    city: str | None = Field(default=None, max_length=120)
    goal_amount: Decimal | None = Field(default=None, gt=0)
    deadline: date | None = None
    category_ids: list[int] | None = None
    translations: list[ProjectTranslationCreate] | None = None


class ProjectStatusChangeRequest(BaseSchema):
    status: ProjectStatus
    reason: str | None = Field(default=None, max_length=1000)


class ProjectUpdateItemCreate(BaseSchema):
    language: str = Field(default="ru", max_length=10)
    title: str = Field(min_length=3, max_length=255)
    text: str = Field(min_length=10)
    is_public: bool = True


class ProjectUpdateItemUpdate(BaseSchema):
    language: str | None = Field(default=None, max_length=10)
    title: str | None = Field(default=None, min_length=3, max_length=255)
    text: str | None = Field(default=None, min_length=10)
    is_public: bool | None = None


class ProjectUpdateItemRead(BaseSchema):
    id: int
    project_id: int
    author_id: int
    language: str
    title: str
    text: str
    is_public: bool
    created_at: datetime
    updated_at: datetime | None


class ProjectRead(ProjectBase):
    id: int
    author_id: int
    status: ProjectStatus
    cover_image_id: int | None
    rejection_reason: str | None
    frozen_reason: str | None

    gross_collected: Decimal = Decimal("0.00")
    net_amount: Decimal = Decimal("0.00")
    platform_fee_amount: Decimal = Decimal("0.00")
    refunded_amount: Decimal = Decimal("0.00")
    progress_percent: int = 0

    created_at: datetime
    updated_at: datetime | None
    submitted_at: datetime | None
    approved_at: datetime | None
    published_at: datetime | None
    translations: list[ProjectTranslationRead] = Field(default_factory=list)
