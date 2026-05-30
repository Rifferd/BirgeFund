from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException, PermissionDeniedException
from app.modules.projects.repository import ProjectRepository
from app.modules.rewards.model import ProjectReward
from app.modules.rewards.repository import ProjectRewardRepository
from app.modules.rewards.schema import ProjectRewardCreate, ProjectRewardUpdate
from app.modules.users.model import User
from app.shared.enums import ProjectStatus


class ProjectRewardService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.projects = ProjectRepository(db)
        self.rewards = ProjectRewardRepository(db)

    async def list_by_project(self, project_id: int) -> list[ProjectReward]:
        project = await self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        return await self.rewards.list_by_project(project_id=project_id)

    async def create(
        self,
        *,
        project_id: int,
        current_user: User,
        data: ProjectRewardCreate,
    ) -> ProjectReward:
        project = await self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно добавлять reward только к своим проектам")

        if project.status not in [ProjectStatus.DRAFT, ProjectStatus.REJECTED]:
            raise BadRequestException("Reward можно менять только в черновике или отклонённом проекте")

        reward = await self.rewards.create(project_id=project_id, data=data)

        await self.db.commit()
        await self.db.refresh(reward)

        return reward

    async def update(
        self,
        *,
        reward_id: int,
        current_user: User,
        data: ProjectRewardUpdate,
    ) -> ProjectReward:
        reward = await self.rewards.get_by_id(reward_id)

        if reward is None:
            raise NotFoundException("Reward не найден")

        project = await self.projects.get_by_id(reward.project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно менять reward только у своих проектов")

        if project.status not in [ProjectStatus.DRAFT, ProjectStatus.REJECTED]:
            raise BadRequestException("Reward можно менять только в черновике или отклонённом проекте")

        reward = await self.rewards.update(reward, data)

        await self.db.commit()
        await self.db.refresh(reward)

        return reward
