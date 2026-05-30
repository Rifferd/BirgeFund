from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.admin.schema import AdminUserUpdate
from app.modules.complaints.model import Complaint
from app.modules.ledger.model import LedgerEntry
from app.modules.payments.model import PaymentAttempt
from app.modules.projects.model import Project
from app.modules.reports.model import ProjectReport
from app.modules.roles.model import Role
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
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def count_users(self) -> int:
        return await self._count(User)

    async def count_active_users(self) -> int:
        statement = select(func.count(User.id)).where(User.is_active.is_(True))
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def count_blocked_users(self) -> int:
        statement = select(func.count(User.id)).where(User.is_blocked.is_(True))
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def count_projects(self) -> int:
        return await self._count(Project)

    async def count_projects_by_status(self, status: ProjectStatus) -> int:
        statement = select(func.count(Project.id)).where(Project.status == status)
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def count_payment_attempts(self) -> int:
        return await self._count(PaymentAttempt)

    async def count_payment_attempts_by_status(self, status: PaymentAttemptStatus) -> int:
        statement = select(func.count(PaymentAttempt.id)).where(PaymentAttempt.status == status)
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def sum_ledger_by_type(self, entry_type: LedgerEntryType) -> Decimal:
        statement = select(func.coalesce(func.sum(LedgerEntry.amount), 0)).where(
            LedgerEntry.type == entry_type,
            LedgerEntry.status == LedgerEntryStatus.POSTED,
        )
        result = await self.db.execute(statement)
        return Decimal(str(result.scalar_one_or_none() or 0))

    async def count_open_complaints(self) -> int:
        statement = select(func.count(Complaint.id)).where(
            Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.IN_REVIEW])
        )
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def count_pending_reports(self) -> int:
        statement = select(func.count(ProjectReport.id)).where(
            ProjectReport.status == ReportStatus.PENDING_REVIEW
        )
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def _count(self, model: type) -> int:
        statement = select(func.count(model.id))
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)


class AdminUserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _options(self):
        return (selectinload(User.roles).selectinload(Role.permissions),)

    async def list_users(self) -> list[User]:
        statement = (
            select(User)
            .options(*self._options())
            .order_by(User.created_at.desc(), User.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def get_by_id(self, user_id: int) -> User | None:
        statement = (
            select(User)
            .options(*self._options())
            .where(User.id == user_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def update_user(self, user: User, data: AdminUserUpdate) -> User:
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        return user

    async def set_blocked(self, user: User, is_blocked: bool) -> User:
        user.is_blocked = is_blocked
        user.is_active = not is_blocked

        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        return user


class AdminProjectRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _options(self):
        from app.modules.categories.model import Category

        return (
            selectinload(Project.translations),
            selectinload(Project.categories).selectinload(Category.translations),
        )

    async def list_projects(self) -> list[Project]:
        statement = (
            select(Project)
            .options(*self._options())
            .order_by(Project.created_at.desc(), Project.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def list_projects_by_status(self, status: ProjectStatus) -> list[Project]:
        statement = (
            select(Project)
            .options(*self._options())
            .where(Project.status == status)
            .order_by(Project.created_at.desc(), Project.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def get_by_id(self, project_id: int) -> Project | None:
        statement = (
            select(Project)
            .options(*self._options())
            .where(Project.id == project_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()
