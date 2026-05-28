from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.admin.repository import (
    AdminDashboardRepository,
    AdminProjectRepository,
    AdminUserRepository,
)
from app.modules.admin.schema import AdminDashboardStats, AdminUserUpdate
from app.modules.audit.service import AuditLogService
from app.modules.ledger.service import LedgerService
from app.modules.projects.model import Project
from app.modules.projects.service import ProjectStatusService
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


class AdminProjectService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.projects = AdminProjectRepository(db)
        self.ledger = LedgerService(db)
        self.status_service = ProjectStatusService(db)

    def list_projects(self, status: ProjectStatus | None = None) -> list[Project]:
        if status is None:
            projects = self.projects.list_projects()
        else:
            projects = self.projects.list_projects_by_status(status)

        return [self.attach_ledger_summary(project) for project in projects]

    def get_project(self, project_id: int) -> Project:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return self.attach_ledger_summary(project)

    def change_status(
        self,
        *,
        project_id: int,
        new_status: ProjectStatus,
        reason: str | None,
        current_user: User,
    ) -> Project:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        project = self.status_service.change_status(
            project=project,
            new_status=new_status,
            actor=current_user,
            reason=reason,
        )

        return self.attach_ledger_summary(project)

    def attach_ledger_summary(self, project: Project) -> Project:
        summary = self.ledger.get_project_summary(project.id)

        project.gross_collected = summary.gross_collected
        project.net_amount = summary.net_amount
        project.platform_fee_amount = summary.platform_fee_amount
        project.refunded_amount = summary.refunded_amount

        if project.goal_amount > 0:
            progress = int((summary.gross_collected / project.goal_amount) * 100)
            project.progress_percent = min(progress, 100)
        else:
            project.progress_percent = 0

        return project


from app.modules.ledger.model import LedgerEntry
from app.modules.ledger.schema import ProjectLedgerSummary
from app.modules.payments.model import PaymentAttempt
from app.modules.payments.repository import PaymentAttemptRepository
from app.modules.refunds.model import Refund
from app.modules.refunds.service import RefundService


class AdminFinanceService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.payments = PaymentAttemptRepository(db)
        self.ledger = LedgerService(db)
        self.refunds = RefundService(db)

    def list_payments(self) -> list[PaymentAttempt]:
        return self.payments.list_all()

    def get_payment(self, payment_id: int) -> PaymentAttempt:
        payment = self.payments.get_by_id(payment_id)

        if payment is None:
            raise NotFoundException("Платёжная попытка не найдена")

        return payment

    def list_project_ledger(self, project_id: int) -> list[LedgerEntry]:
        return self.ledger.list_by_project(project_id)

    def get_project_ledger_summary(self, project_id: int) -> ProjectLedgerSummary:
        return self.ledger.get_project_summary(project_id)

    def list_refunds(self) -> list[Refund]:
        return self.refunds.list_all()

    def list_project_refunds(self, project_id: int) -> list[Refund]:
        return self.refunds.list_by_project(project_id)

    def create_refund(
        self,
        *,
        payment_attempt_id: int,
        reason: str,
        current_user: User,
    ) -> Refund:
        return self.refunds.create_refund(
            payment_attempt_id=payment_attempt_id,
            reason=reason,
            current_user=current_user,
        )


from app.modules.audit.model import AuditLog


class AdminAuditLogService:
    def __init__(self, db: Session) -> None:
        self.audit = AuditLogService(db)

    def list_logs(
        self,
        *,
        limit: int = 100,
        entity_type: str | None = None,
        entity_id: str | None = None,
        actor_id: int | None = None,
    ) -> list[AuditLog]:
        if entity_type is not None and entity_id is not None:
            return self.audit.list_by_entity(
                entity_type=entity_type,
                entity_id=entity_id,
                limit=limit,
            )

        if actor_id is not None:
            return self.audit.list_by_actor(actor_id=actor_id, limit=limit)

        return self.audit.list_latest(limit=limit)

    def get_log(self, audit_log_id: int) -> AuditLog:
        return self.audit.get_by_id(audit_log_id)
