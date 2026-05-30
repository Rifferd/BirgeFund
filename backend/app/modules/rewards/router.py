from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database_session
from app.modules.rewards.schema import ProjectRewardCreate, ProjectRewardRead, ProjectRewardUpdate
from app.modules.rewards.service import ProjectRewardService
from app.modules.users.model import User

router = APIRouter(tags=["rewards"])


@router.get("/projects/{project_id}/rewards", response_model=list[ProjectRewardRead])
async def list_project_rewards(
    project_id: int,
    db: AsyncSession = Depends(get_database_session),
) -> list[ProjectRewardRead]:
    service = ProjectRewardService(db)
    return await service.list_by_project(project_id)


@router.post(
    "/projects/{project_id}/rewards",
    response_model=ProjectRewardRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project_reward(
    project_id: int,
    payload: ProjectRewardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRewardRead:
    service = ProjectRewardService(db)
    return await service.create(
        project_id=project_id,
        current_user=current_user,
        data=payload,
    )


@router.patch("/rewards/{reward_id}", response_model=ProjectRewardRead)
async def update_project_reward(
    reward_id: int,
    payload: ProjectRewardUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> ProjectRewardRead:
    service = ProjectRewardService(db)
    return await service.update(
        reward_id=reward_id,
        current_user=current_user,
        data=payload,
    )
