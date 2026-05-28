from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.admin.repository import AdminDashboardRepository, AdminUserRepository
from app.modules.admin.schema import AdminDashboardStats, AdminUserUpdate
from app.modules.audit.service import AuditLogService
from app.modules.users.model import User
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


class AdminUserService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = AdminUserRepository(db)
        self.audit = AuditLogService(db)

    def list_users(self) -> list[User]:
        return self.users.list_users()

    def get_user(self, user_id: int) -> User:
        user = self.users.get_by_id(user_id)

        if user is None:
            raise NotFoundException("Пользователь не найден")

        return user

    def update_user(self, *, user_id: int, data: AdminUserUpdate, current_user: User) -> User:
        user = self.get_user(user_id)

        old_values = {
            "full_name": user.full_name,
            "preferred_language": user.preferred_language,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
        }

        user = self.users.update_user(user, data)

        self.audit.create_log(
            action="admin.user_updated",
            entity_type="user",
            entity_id=user.id,
            actor=current_user,
            old_values=old_values,
            new_values={
                "full_name": user.full_name,
                "preferred_language": user.preferred_language,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
            },
        )

        self.db.commit()
        self.db.refresh(user)

        return user

    def block_user(self, *, user_id: int, reason: str | None, current_user: User) -> User:
        user = self.get_user(user_id)

        if user.id == current_user.id:
            raise BadRequestException("Нельзя заблокировать самого себя")

        old_values = {
            "is_active": user.is_active,
            "is_blocked": user.is_blocked,
        }

        user = self.users.set_blocked(user, True)

        self.audit.create_log(
            action="admin.user_blocked",
            entity_type="user",
            entity_id=user.id,
            actor=current_user,
            old_values=old_values,
            new_values={
                "is_active": user.is_active,
                "is_blocked": user.is_blocked,
            },
            meta={"reason": reason} if reason else None,
        )

        self.db.commit()
        self.db.refresh(user)

        return user

    def unblock_user(self, *, user_id: int, reason: str | None, current_user: User) -> User:
        user = self.get_user(user_id)

        old_values = {
            "is_active": user.is_active,
            "is_blocked": user.is_blocked,
        }

        user = self.users.set_blocked(user, False)

        self.audit.create_log(
            action="admin.user_unblocked",
            entity_type="user",
            entity_id=user.id,
            actor=current_user,
            old_values=old_values,
            new_values={
                "is_active": user.is_active,
                "is_blocked": user.is_blocked,
            },
            meta={"reason": reason} if reason else None,
        )

        self.db.commit()
        self.db.refresh(user)

        return user
