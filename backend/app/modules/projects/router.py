from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database_session
from app.core.permissions import Permissions, require_any_permission
from app.modules.projects.schema import (
    ProjectCreate,
    ProjectRead,
    ProjectStatusChangeRequest,
    ProjectUpdate,
    ProjectUpdateItemCreate,
    ProjectUpdateItemRead,
)
from app.modules.projects.service import ProjectService
from app.modules.users.model import User

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def list_public_projects(
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectRead]:
    service = ProjectService(db)
    return await service.list_public()


@router.get("/my", response_model=list[ProjectRead])
async def list_my_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectRead]:
    service = ProjectService(db)
    return await service.list_my_projects(current_user)


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRead:
    service = ProjectService(db)
    return await service.create_draft(current_user, payload)


@router.post("/{project_id}/submit-review", response_model=ProjectRead)
async def submit_project_to_review(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRead:
    service = ProjectService(db)
    return await service.submit_to_review(project_id, current_user)


@router.patch("/{project_id}/status", response_model=ProjectRead)
async def change_project_status(
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
    service = ProjectService(db)
    return await service.change_status(
        project_id=project_id,
        new_status=payload.status,
        current_user=current_user,
        reason=payload.reason,
    )


@router.get("/{project_id}/updates", response_model=list[ProjectUpdateItemRead])
async def list_project_updates(
    project_id: int,
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectUpdateItemRead]:
    service = ProjectService(db)
    return await service.list_public_updates(project_id)


@router.get("/{project_id}/updates/my", response_model=list[ProjectUpdateItemRead])
async def list_my_project_updates(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectUpdateItemRead]:
    service = ProjectService(db)
    return await service.list_my_project_updates(project_id, current_user)


@router.post(
    "/{project_id}/updates",
    response_model=ProjectUpdateItemRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project_update(
    project_id: int,
    payload: ProjectUpdateItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectUpdateItemRead:
    service = ProjectService(db)
    return await service.create_update(
        project_id=project_id,
        current_user=current_user,
        data=payload,
    )


@router.get("/{slug}", response_model=ProjectRead)
async def get_project_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRead:
    service = ProjectService(db)
    return await service.get_by_slug(slug)


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRead:
    service = ProjectService(db)
    return await service.update_draft(project_id, current_user, payload)
