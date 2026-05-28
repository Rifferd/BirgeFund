from datetime import datetime
from decimal import Decimal

from pydantic import EmailStr, Field

from app.shared.schemas import BaseSchema


class AdminDashboardStats(BaseSchema):
    total_users: int
    active_users: int
    blocked_users: int

    total_projects: int
    draft_projects: int
    pending_review_projects: int
    fundraising_projects: int
    funded_projects: int
    completed_projects: int

    total_payment_attempts: int
    successful_payment_attempts: int
    pending_payment_attempts: int

    gross_collected: Decimal
    platform_fee_amount: Decimal
    refunded_amount: Decimal

    open_complaints: int
    pending_reports: int


class AdminUserRead(BaseSchema):
    id: int
    email: EmailStr
    full_name: str | None
    preferred_language: str
    is_active: bool
    is_verified: bool
    is_blocked: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime | None


class AdminUserUpdate(BaseSchema):
    full_name: str | None = Field(default=None, max_length=255)
    preferred_language: str | None = Field(default=None, max_length=10)
    is_active: bool | None = None
    is_verified: bool | None = None


class AdminUserBlockRequest(BaseSchema):
    reason: str | None = Field(default=None, max_length=1000)
