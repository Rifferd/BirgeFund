from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.complaints.schema import (
    ComplaintCreate,
    ComplaintModerationRequest,
    ComplaintRead,
)
from app.modules.complaints.service import ComplaintService
from app.modules.users.model import User

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("", response_model=ComplaintRead, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ComplaintRead:
    service = ComplaintService(db)
    return await service.create(current_user=current_user, data=payload)


@router.get("/my", response_model=list[ComplaintRead])
async def list_my_complaints(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> list[ComplaintRead]:
    service = ComplaintService(db)
    return await service.list_my(current_user)


@router.get("/open", response_model=list[ComplaintRead])
async def list_open_complaints(
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[ComplaintRead]:
    service = ComplaintService(db)
    return await service.list_open()


@router.get("/projects/{project_id}", response_model=list[ComplaintRead])
async def list_project_complaints(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[ComplaintRead]:
    service = ComplaintService(db)
    return await service.list_by_project(project_id)


@router.patch("/{complaint_id}/status", response_model=ComplaintRead)
async def moderate_complaint(
    complaint_id: int,
    payload: ComplaintModerationRequest,
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> ComplaintRead:
    service = ComplaintService(db)
    return await service.moderate(
        complaint_id=complaint_id,
        current_user=current_user,
        data=payload,
    )
