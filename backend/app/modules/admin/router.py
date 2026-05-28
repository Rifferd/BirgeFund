from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_any_permission, require_permission
from app.modules.audit.schema import AuditLogRead
from app.modules.admin.schema import (
    AdminDashboardStats,
    AdminUserBlockRequest,
    AdminUserRead,
    AdminUserUpdate,
)
from app.modules.admin.service import (
    AdminAuditLogService,
    AdminDashboardService,
    AdminFinanceService,
    AdminProjectService,
    AdminUserService,
)
from app.modules.ledger.schema import LedgerEntryRead, ProjectLedgerSummary
from app.modules.payments.schema import PaymentAttemptRead
from app.modules.projects.schema import ProjectRead, ProjectStatusChangeRequest
from app.modules.refunds.schema import RefundCreateRequest, RefundRead
from app.modules.users.model import User
from app.shared.enums import ProjectStatus

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard(
    current_user: User = Depends(require_permission(Permissions.ADMIN_DASHBOARD)),
    db: Session = Depends(get_database_session),
) -> AdminDashboardStats:
    service = AdminDashboardService(db)
    return service.get_stats()


@router.get("/users", response_model=list[AdminUserRead])
def list_admin_users(
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
    db: Session = Depends(get_database_session),
) -> list[AdminUserRead]:
    service = AdminUserService(db)
    return service.list_users()


@router.get("/users/{user_id}", response_model=AdminUserRead)
def get_admin_user(
    user_id: int,
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
    db: Session = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return service.get_user(user_id)


@router.patch("/users/{user_id}", response_model=AdminUserRead)
def update_admin_user(
    user_id: int,
    payload: AdminUserUpdate,
    current_user: User = Depends(require_permission(Permissions.USERS_UPDATE)),
    db: Session = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return service.update_user(
        user_id=user_id,
        data=payload,
        current_user=current_user,
    )


@router.patch("/users/{user_id}/block", response_model=AdminUserRead)
def block_admin_user(
    user_id: int,
    payload: AdminUserBlockRequest,
    current_user: User = Depends(require_permission(Permissions.USERS_BLOCK)),
    db: Session = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return service.block_user(
        user_id=user_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.patch("/users/{user_id}/unblock", response_model=AdminUserRead)
def unblock_admin_user(
    user_id: int,
    payload: AdminUserBlockRequest,
    current_user: User = Depends(require_permission(Permissions.USERS_BLOCK)),
    db: Session = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return service.unblock_user(
        user_id=user_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/projects", response_model=list[ProjectRead])
def list_admin_projects(
    status: ProjectStatus | None = Query(default=None),
    current_user: User = Depends(require_permission(Permissions.PROJECTS_MODERATE)),
    db: Session = Depends(get_database_session),
) -> list[ProjectRead]:
    service = AdminProjectService(db)
    return service.list_projects(status=status)


@router.get("/projects/{project_id}", response_model=ProjectRead)
def get_admin_project(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PROJECTS_MODERATE)),
    db: Session = Depends(get_database_session),
) -> ProjectRead:
    service = AdminProjectService(db)
    return service.get_project(project_id)


@router.patch("/projects/{project_id}/status", response_model=ProjectRead)
def change_admin_project_status(
    project_id: int,
    payload: ProjectStatusChangeRequest,
    current_user: User = Depends(
        require_any_permission(
            [
                Permissions.PROJECTS_MODERATE,
                Permissions.PROJECTS_FREEZE,
            ]
        )
    ),
    db: Session = Depends(get_database_session),
) -> ProjectRead:
    service = AdminProjectService(db)
    return service.change_status(
        project_id=project_id,
        new_status=payload.status,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/payments", response_model=list[PaymentAttemptRead])
def list_admin_payments(
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: Session = Depends(get_database_session),
) -> list[PaymentAttemptRead]:
    service = AdminFinanceService(db)
    return service.list_payments()


@router.get("/payments/{payment_id}", response_model=PaymentAttemptRead)
def get_admin_payment(
    payment_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: Session = Depends(get_database_session),
) -> PaymentAttemptRead:
    service = AdminFinanceService(db)
    return service.get_payment(payment_id)


@router.post("/payments/{payment_id}/refund", response_model=RefundRead)
def create_admin_refund(
    payment_id: int,
    payload: RefundCreateRequest,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_REFUND)),
    db: Session = Depends(get_database_session),
) -> RefundRead:
    service = AdminFinanceService(db)
    return service.create_refund(
        payment_attempt_id=payment_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/ledger/projects/{project_id}", response_model=list[LedgerEntryRead])
def list_admin_project_ledger(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: Session = Depends(get_database_session),
) -> list[LedgerEntryRead]:
    service = AdminFinanceService(db)
    return service.list_project_ledger(project_id)


@router.get("/ledger/projects/{project_id}/summary", response_model=ProjectLedgerSummary)
def get_admin_project_ledger_summary(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: Session = Depends(get_database_session),
) -> ProjectLedgerSummary:
    service = AdminFinanceService(db)
    return service.get_project_ledger_summary(project_id)


@router.get("/refunds", response_model=list[RefundRead])
def list_admin_refunds(
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: Session = Depends(get_database_session),
) -> list[RefundRead]:
    service = AdminFinanceService(db)
    return service.list_refunds()


@router.get("/projects/{project_id}/refunds", response_model=list[RefundRead])
def list_admin_project_refunds(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: Session = Depends(get_database_session),
) -> list[RefundRead]:
    service = AdminFinanceService(db)
    return service.list_project_refunds(project_id)



@router.get("/audit-logs", response_model=list[AuditLogRead])
def list_admin_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    entity_type: str | None = Query(default=None),
    entity_id: str | None = Query(default=None),
    actor_id: int | None = Query(default=None),
    current_user: User = Depends(require_permission(Permissions.AUDIT_READ)),
    db: Session = Depends(get_database_session),
) -> list[AuditLogRead]:
    service = AdminAuditLogService(db)
    return service.list_logs(
        limit=limit,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
    )


@router.get("/audit-logs/{audit_log_id}", response_model=AuditLogRead)
def get_admin_audit_log(
    audit_log_id: int,
    current_user: User = Depends(require_permission(Permissions.AUDIT_READ)),
    db: Session = Depends(get_database_session),
) -> AuditLogRead:
    service = AdminAuditLogService(db)
    return service.get_log(audit_log_id)
