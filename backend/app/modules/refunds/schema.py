from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.shared.schemas import BaseSchema


class RefundCreateRequest(BaseSchema):
    reason: str = Field(min_length=5, max_length=1000)


class RefundCreate(BaseSchema):
    payment_attempt_id: int
    project_id: int
    user_id: int
    amount: Decimal
    currency: str = "KGS"
    reason: str
    created_by_id: int | None = None


class RefundRead(BaseSchema):
    id: int
    payment_attempt_id: int
    project_id: int
    user_id: int
    amount: Decimal
    currency: str
    reason: str
    created_by_id: int | None
    created_at: datetime
