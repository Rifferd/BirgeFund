from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import Field

from app.shared.enums import LedgerEntryStatus, LedgerEntryType
from app.shared.schemas import BaseSchema


class LedgerEntryCreate(BaseSchema):
    project_id: int
    user_id: int | None = None
    payment_attempt_id: int | None = None
    type: LedgerEntryType
    amount: Decimal
    currency: str = Field(default="KGS", max_length=3)
    status: LedgerEntryStatus = LedgerEntryStatus.POSTED
    meta: dict[str, Any] | None = None
    created_by_id: int | None = None


class LedgerEntryRead(BaseSchema):
    id: int
    project_id: int
    user_id: int | None
    payment_attempt_id: int | None
    type: LedgerEntryType
    amount: Decimal
    currency: str
    status: LedgerEntryStatus
    meta: dict[str, Any] | None
    created_by_id: int | None
    created_at: datetime


class ProjectLedgerSummary(BaseSchema):
    project_id: int
    gross_collected: Decimal
    net_amount: Decimal
    platform_fee_amount: Decimal
    refunded_amount: Decimal
    currency: str = "KGS"
