from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.comments.schema import (
    CommentCreate,
    CommentModerationRequest,
    CommentRead,
    CommentUpdate,
)
from app.modules.comments.service import CommentService
from app.modules.users.model import User

router = APIRouter(tags=["comments"])


@router.get("/projects/{project_id}/comments", response_model=list[CommentRead])
async def list_project_comments(
    project_id: int,
    db: AsyncSession = Depends(get_database_session),
) -> list[CommentRead]:
    service = CommentService(db)
    return await service.list_public_by_project(project_id)


@router.get("/projects/{project_id}/comments/all", response_model=list[CommentRead])
async def list_all_project_comments(
    project_id: int,
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[CommentRead]:
    service = CommentService(db)
    return await service.list_all_by_project(project_id)


@router.post(
    "/projects/{project_id}/comments",
    response_model=CommentRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project_comment(
    project_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> CommentRead:
    service = CommentService(db)
    return await service.create(
        project_id=project_id,
        current_user=current_user,
        data=payload,
    )


@router.patch("/comments/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> CommentRead:
    service = CommentService(db)
    return await service.update(
        comment_id=comment_id,
        current_user=current_user,
        data=payload,
    )


@router.patch("/comments/{comment_id}/moderation", response_model=CommentRead)
async def moderate_comment(
    comment_id: int,
    payload: CommentModerationRequest,
    current_user: User = Depends(require_permission(Permissions.COMPLAINTS_MANAGE)),
    db: AsyncSession = Depends(get_database_session),
) -> CommentRead:
    service = CommentService(db)
    return await service.moderate(comment_id=comment_id, data=payload)
