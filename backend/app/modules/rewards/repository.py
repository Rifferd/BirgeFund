from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.rewards.model import ProjectReward
from app.modules.rewards.schema import ProjectRewardCreate, ProjectRewardUpdate


class ProjectRewardRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, reward_id: int) -> ProjectReward | None:
        statement = select(ProjectReward).where(ProjectReward.id == reward_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_project(self, project_id: int, active_only: bool = False) -> list[ProjectReward]:
        statement = select(ProjectReward).where(ProjectReward.project_id == project_id)

        if active_only:
            statement = statement.where(ProjectReward.is_active.is_(True))

        statement = statement.order_by(ProjectReward.amount.asc(), ProjectReward.id.asc())

        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create(self, *, project_id: int, data: ProjectRewardCreate) -> ProjectReward:
        reward = ProjectReward(
            project_id=project_id,
            **data.model_dump(),
        )

        self.db.add(reward)
        await self.db.flush()
        await self.db.refresh(reward)

        return reward

    async def update(self, reward: ProjectReward, data: ProjectRewardUpdate) -> ProjectReward:
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(reward, field, value)

        self.db.add(reward)
        await self.db.flush()
        await self.db.refresh(reward)

        return reward
