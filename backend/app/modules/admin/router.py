from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_any_permission, require_permission
from app.modules.audit.schema import AuditLogRead
from app.modules.complaints.schema import ComplaintModerationRequest, ComplaintRead
from app.modules.reports.schema import ProjectReportModerationRequest, ProjectReportRead
from app.modules.admin.schema import (
    AdminAssignRoleRequest,
    AdminDashboardStats,
    AdminSeedPermissionsResponse,
    AdminUserBlockRequest,
    AdminUserRead,
    AdminUserUpdate,
)
from app.modules.admin.service import (
    AdminAuditLogService,
    AdminDashboardService,
    AdminFinanceService,
    AdminModerationService,
    AdminProjectService,
    AdminRoleService,
    AdminUserService,
)
from app.modules.ledger.schema import LedgerEntryRead, ProjectLedgerSummary
from app.modules.payments.schema import PaymentAttemptRead
from app.modules.projects.schema import ProjectRead, ProjectStatusChangeRequest
from app.modules.refunds.schema import RefundCreateRequest, RefundRead
from app.modules.roles.schema import PermissionRead, RoleCreate, RoleRead
from app.modules.users.model import User
from app.shared.enums import ComplaintStatus, ProjectStatus, ReportStatus

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardStats)
async def get_admin_dashboard(
    current_user: User = Depends(require_permission(Permissions.ADMIN_DASHBOARD)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminDashboardStats:
    service = AdminDashboardService(db)
    return await service.get_stats()


@router.get("/users", response_model=list[AdminUserRead])
async def list_admin_users(
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[AdminUserRead]:
    service = AdminUserService(db)
    return await service.list_users()


@router.get("/users/{user_id}", response_model=AdminUserRead)
async def get_admin_user(
    user_id: int,
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return await service.get_user(user_id)


@router.patch("/users/{user_id}", response_model=AdminUserRead)
async def update_admin_user(
    user_id: int,
    payload: AdminUserUpdate,
    current_user: User = Depends(require_permission(Permissions.USERS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return await service.update_user(
        user_id=user_id,
        data=payload,
        current_user=current_user,
    )


@router.patch("/users/{user_id}/block", response_model=AdminUserRead)
async def block_admin_user(
    user_id: int,
    payload: AdminUserBlockRequest,
    current_user: User = Depends(require_permission(Permissions.USERS_BLOCK)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return await service.block_user(
        user_id=user_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.patch("/users/{user_id}/unblock", response_model=AdminUserRead)
async def unblock_admin_user(
    user_id: int,
    payload: AdminUserBlockRequest,
    current_user: User = Depends(require_permission(Permissions.USERS_BLOCK)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminUserService(db)
    return await service.unblock_user(
        user_id=user_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/projects", response_model=list[ProjectRead])
async def list_admin_projects(
    status: ProjectStatus | None = Query(default=None),
    current_user: User = Depends(require_permission(Permissions.PROJECTS_MODERATE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectRead]:
    service = AdminProjectService(db)
    return await service.list_projects(status=status)


@router.get("/projects/{project_id}", response_model=ProjectRead)
async def get_admin_project(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PROJECTS_MODERATE)),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRead:
    service = AdminProjectService(db)
    return await service.get_project(project_id)


@router.patch("/projects/{project_id}/status", response_model=ProjectRead)
async def change_admin_project_status(
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
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRead:
    service = AdminProjectService(db)
    return await service.change_status(
        project_id=project_id,
        new_status=payload.status,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/payments", response_model=list[PaymentAttemptRead])
async def list_admin_payments(
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[PaymentAttemptRead]:
    service = AdminFinanceService(db)
    return await service.list_payments()


@router.get("/payments/{payment_id}", response_model=PaymentAttemptRead)
async def get_admin_payment(
    payment_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> PaymentAttemptRead:
    service = AdminFinanceService(db)
    return await service.get_payment(payment_id)


@router.post("/payments/{payment_id}/refund", response_model=RefundRead)
async def create_admin_refund(
    payment_id: int,
    payload: RefundCreateRequest,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_REFUND)),
    db: AsyncSession = Depends(get_database_session),
) -> RefundRead:
    service = AdminFinanceService(db)
    return await service.create_refund(
        payment_attempt_id=payment_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/ledger/projects/{project_id}", response_model=list[LedgerEntryRead])
async def list_admin_project_ledger(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[LedgerEntryRead]:
    service = AdminFinanceService(db)
    return await service.list_project_ledger(project_id)


@router.get("/ledger/projects/{project_id}/summary", response_model=ProjectLedgerSummary)
async def get_admin_project_ledger_summary(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectLedgerSummary:
    service = AdminFinanceService(db)
    return await service.get_project_ledger_summary(project_id)


@router.get("/refunds", response_model=list[RefundRead])
async def list_admin_refunds(
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[RefundRead]:
    service = AdminFinanceService(db)
    return await service.list_refunds()


@router.get("/projects/{project_id}/refunds", response_model=list[RefundRead])
async def list_admin_project_refunds(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[RefundRead]:
    service = AdminFinanceService(db)
    return await service.list_project_refunds(project_id)



@router.get("/audit-logs", response_model=list[AuditLogRead])
async def list_admin_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    entity_type: str | None = Query(default=None),
    entity_id: str | None = Query(default=None),
    actor_id: int | None = Query(default=None),
    current_user: User = Depends(require_permission(Permissions.AUDIT_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[AuditLogRead]:
    service = AdminAuditLogService(db)
    return await service.list_logs(
        limit=limit,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
    )


@router.get("/audit-logs/{audit_log_id}", response_model=AuditLogRead)
async def get_admin_audit_log(
    audit_log_id: int,
    current_user: User = Depends(require_permission(Permissions.AUDIT_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> AuditLogRead:
    service = AdminAuditLogService(db)
    return await service.get_log(audit_log_id)



@router.get("/reports", response_model=list[ProjectReportRead])
async def list_admin_reports(
    status: ReportStatus | None = Query(default=None),
    current_user: User = Depends(require_permission(Permissions.REPORTS_MODERATE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectReportRead]:
    service = AdminModerationService(db)
    return await service.list_reports(status=status)


@router.patch("/reports/{report_id}/status", response_model=ProjectReportRead)
async def moderate_admin_report(
    report_id: int,
    payload: ProjectReportModerationRequest,
    current_user: User = Depends(require_permission(Permissions.REPORTS_MODERATE)),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectReportRead:
    service = AdminModerationService(db)
    return await service.moderate_report(
        report_id=report_id,
        payload=payload,
    )


@router.get("/complaints", response_model=list[ComplaintRead])
async def list_admin_complaints(
    status: ComplaintStatus | None = Query(default=None),
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[ComplaintRead]:
    service = AdminModerationService(db)
    return await service.list_complaints(status=status)


@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintRead)
async def moderate_admin_complaint(
    complaint_id: int,
    payload: ComplaintModerationRequest,
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> ComplaintRead:
    service = AdminModerationService(db)
    return await service.moderate_complaint(
        complaint_id=complaint_id,
        current_user=current_user,
        payload=payload,
    )



@router.get("/permissions", response_model=list[PermissionRead])
async def list_admin_permissions(
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[PermissionRead]:
    service = AdminRoleService(db)
    return await service.list_permissions()


@router.post("/permissions/seed", response_model=AdminSeedPermissionsResponse)
async def seed_admin_permissions(
    current_user: User = Depends(require_permission(Permissions.USERS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminSeedPermissionsResponse:
    service = AdminRoleService(db)
    return await service.seed_permissions(current_user)


@router.get("/roles", response_model=list[RoleRead])
async def list_admin_roles(
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
    db: AsyncSession = Depends(get_database_session),
) -> list[RoleRead]:
    service = AdminRoleService(db)
    return await service.list_roles()


@router.post("/roles", response_model=RoleRead)
async def create_admin_role(
    payload: RoleCreate,
    current_user: User = Depends(require_permission(Permissions.USERS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> RoleRead:
    service = AdminRoleService(db)
    return await service.create_role(data=payload, current_user=current_user)


@router.post("/users/{user_id}/roles", response_model=AdminUserRead)
async def assign_admin_role_to_user(
    user_id: int,
    payload: AdminAssignRoleRequest,
    current_user: User = Depends(require_permission(Permissions.USERS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> AdminUserRead:
    service = AdminRoleService(db)
    return await service.assign_role_to_user(
        user_id=user_id,
        role_name=payload.role_name,
        current_user=current_user,
    )
