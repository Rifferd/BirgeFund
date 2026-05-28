from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.complaints.model import Complaint
from app.modules.ledger.model import LedgerEntry
from app.modules.payments.model import PaymentAttempt
from app.modules.projects.model import Project
from app.modules.reports.model import ProjectReport
from app.modules.users.model import User
from app.shared.enums import (
    ComplaintStatus,
    LedgerEntryStatus,
    LedgerEntryType,
    PaymentAttemptStatus,
    ProjectStatus,
    ReportStatus,
)


class AdminDashboardRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def count_users(self) -> int:
        return self._count(User)

    def count_active_users(self) -> int:
        statement = select(func.count(User.id)).where(User.is_active.is_(True))
        return int(self.db.scalar(statement) or 0)

    def count_blocked_users(self) -> int:
        statement = select(func.count(User.id)).where(User.is_blocked.is_(True))
        return int(self.db.scalar(statement) or 0)

    def count_projects(self) -> int:
        return self._count(Project)

    def count_projects_by_status(self, status: ProjectStatus) -> int:
        statement = select(func.count(Project.id)).where(Project.status == status)
        return int(self.db.scalar(statement) or 0)

    def count_payment_attempts(self) -> int:
        return self._count(PaymentAttempt)

    def count_payment_attempts_by_status(self, status: PaymentAttemptStatus) -> int:
        statement = select(func.count(PaymentAttempt.id)).where(PaymentAttempt.status == status)
        return int(self.db.scalar(statement) or 0)

    def sum_ledger_by_type(self, entry_type: LedgerEntryType) -> Decimal:
        statement = select(func.coalesce(func.sum(LedgerEntry.amount), 0)).where(
            LedgerEntry.type == entry_type,
            LedgerEntry.status == LedgerEntryStatus.POSTED,
        )
        return Decimal(str(self.db.scalar(statement) or 0))

    def count_open_complaints(self) -> int:
        statement = select(func.count(Complaint.id)).where(
            Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.IN_REVIEW])
        )
        return int(self.db.scalar(statement) or 0)

    def count_pending_reports(self) -> int:
        statement = select(func.count(ProjectReport.id)).where(
            ProjectReport.status == ReportStatus.PENDING_REVIEW
        )
        return int(self.db.scalar(statement) or 0)

    def _count(self, model: type) -> int:
        statement = select(func.count(model.id))
        return int(self.db.scalar(statement) or 0)
