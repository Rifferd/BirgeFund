from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_any_permission, require_permission
from app.modules.admin.schema import (
    AdminDashboardStats,
    AdminUserBlockRequest,
    AdminUserRead,
    AdminUserUpdate,
)
from app.modules.admin.service import AdminDashboardService, AdminProjectService, AdminUserService
from app.modules.projects.schema import ProjectRead, ProjectStatusChangeRequest
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
