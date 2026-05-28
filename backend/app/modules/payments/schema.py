from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import Field

from app.shared.enums import MockPaymentMethod, PaymentAttemptStatus, ProjectType
from app.shared.schemas import BaseSchema


class MockPaymentCreateRequest(BaseSchema):
    project_id: int
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="KGS", max_length=3)
    method: MockPaymentMethod
    idempotency_key: str = Field(min_length=8, max_length=255)
    request_payload: dict[str, Any] | None = None


class MockPaymentConfirmRequest(BaseSchema):
    payment_attempt_id: int


class PaymentAttemptRead(BaseSchema):
    id: int
    user_id: int
    project_id: int
    amount: Decimal
    currency: str
    method: MockPaymentMethod
    status: PaymentAttemptStatus
    idempotency_key: str
    request_payload: dict[str, Any] | None
    failure_reason: str | None
    created_at: datetime
    confirmed_at: datetime | None
    cancelled_at: datetime | None
    failed_at: datetime | None


class PlatformFeeRuleCreate(BaseSchema):
    project_type: ProjectType
    percent: Decimal = Field(ge=0, le=100)
    min_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_active: bool = True


class PlatformFeeRuleUpdate(BaseSchema):
    percent: Decimal | None = Field(default=None, ge=0, le=100)
    min_amount: Decimal | None = Field(default=None, ge=0)
    is_active: bool | None = None


class PlatformFeeRuleRead(BaseSchema):
    id: int
    project_type: ProjectType
    percent: Decimal
    min_amount: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime | None
