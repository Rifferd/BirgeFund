from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.admin.schema import (
    AdminDashboardStats,
    AdminUserBlockRequest,
    AdminUserRead,
    AdminUserUpdate,
)
from app.modules.admin.service import AdminDashboardService, AdminUserService
from app.modules.users.model import User

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
