from decimal import Decimal

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
