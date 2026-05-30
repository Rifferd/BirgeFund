from datetime import date, datetime
from decimal import Decimal

from pydantic import Field, model_validator

from app.shared.schemas import BaseSchema


class ProjectRewardBase(BaseSchema):
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=5)
    amount: Decimal = Field(gt=0)
    limit_count: int | None = Field(default=None, ge=1)
    requires_delivery: bool = False
    estimated_delivery_date: date | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def validate_delivery_date(self) -> "ProjectRewardBase":
        if self.requires_delivery and self.estimated_delivery_date is None:
            raise ValueError("Для reward с доставкой нужно указать примерную дату выдачи")

        return self


class ProjectRewardCreate(ProjectRewardBase):
    pass


class ProjectRewardUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=5)
    amount: Decimal | None = Field(default=None, gt=0)
    limit_count: int | None = Field(default=None, ge=1)
    requires_delivery: bool | None = None
    estimated_delivery_date: date | None = None
    is_active: bool | None = None


class ProjectRewardRead(ProjectRewardBase):
    id: int
    project_id: int
    claimed_count: int
    is_available: bool
    created_at: datetime
    updated_at: datetime | None
