from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.admin.schema import AdminUserUpdate
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


class AdminUserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_users(self) -> list[User]:
        statement = select(User).order_by(User.created_at.desc(), User.id.desc())
        return list(self.db.scalars(statement).all())

    def get_by_id(self, user_id: int) -> User | None:
        statement = select(User).where(User.id == user_id)
        return self.db.scalar(statement)

    def update_user(self, user: User, data: AdminUserUpdate) -> User:
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)

        return user

    def set_blocked(self, user: User, is_blocked: bool) -> User:
        user.is_blocked = is_blocked

        if is_blocked:
            user.is_active = False
        else:
            user.is_active = True

        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)

        return user


class AdminProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_projects(self) -> list[Project]:
        statement = select(Project).order_by(Project.created_at.desc(), Project.id.desc())
        return list(self.db.scalars(statement).all())

    def list_projects_by_status(self, status: ProjectStatus) -> list[Project]:
        statement = (
            select(Project)
            .where(Project.status == status)
            .order_by(Project.created_at.desc(), Project.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def get_by_id(self, project_id: int) -> Project | None:
        statement = select(Project).where(Project.id == project_id)
        return self.db.scalar(statement)
