from sqlalchemy.orm import Session

from app.modules.admin.repository import AdminDashboardRepository
from app.modules.admin.schema import AdminDashboardStats
from app.shared.enums import LedgerEntryType, PaymentAttemptStatus, ProjectStatus


class AdminDashboardService:
    def __init__(self, db: Session) -> None:
        self.repository = AdminDashboardRepository(db)

    def get_stats(self) -> AdminDashboardStats:
        platform_fee = self.repository.sum_ledger_by_type(LedgerEntryType.PLATFORM_FEE)
        refund = self.repository.sum_ledger_by_type(LedgerEntryType.REFUND)

        return AdminDashboardStats(
            total_users=self.repository.count_users(),
            active_users=self.repository.count_active_users(),
            blocked_users=self.repository.count_blocked_users(),

            total_projects=self.repository.count_projects(),
            draft_projects=self.repository.count_projects_by_status(ProjectStatus.DRAFT),
            pending_review_projects=self.repository.count_projects_by_status(ProjectStatus.PENDING_REVIEW),
            fundraising_projects=self.repository.count_projects_by_status(ProjectStatus.FUNDRAISING),
            funded_projects=self.repository.count_projects_by_status(ProjectStatus.FUNDED),
            completed_projects=self.repository.count_projects_by_status(ProjectStatus.COMPLETED),

            total_payment_attempts=self.repository.count_payment_attempts(),
            successful_payment_attempts=self.repository.count_payment_attempts_by_status(
                PaymentAttemptStatus.SUCCESS
            ),
            pending_payment_attempts=self.repository.count_payment_attempts_by_status(
                PaymentAttemptStatus.PENDING
            ),

            gross_collected=self.repository.sum_ledger_by_type(LedgerEntryType.PROJECT_GROSS) + refund,
            platform_fee_amount=abs(platform_fee),
            refunded_amount=abs(refund),

            open_complaints=self.repository.count_open_complaints(),
            pending_reports=self.repository.count_pending_reports(),
        )
