from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.categories.model import Category
from app.modules.projects.model import Project, ProjectTranslation, ProjectUpdateItem
from app.modules.projects.schema import ProjectCreate, ProjectUpdate
from app.shared.enums import ProjectStatus


class ProjectRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _project_options(self):
        return (
            selectinload(Project.translations),
            selectinload(Project.categories).selectinload(Category.translations),
        )

    async def get_by_id(self, project_id: int) -> Project | None:
        statement = (
            select(Project)
            .options(*self._project_options())
            .where(Project.id == project_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Project | None:
        statement = (
            select(Project)
            .options(*self._project_options())
            .where(Project.slug == slug)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_public(self) -> list[Project]:
        statement = (
            select(Project)
            .options(*self._project_options())
            .where(
                Project.status.in_(
                    [
                        ProjectStatus.FUNDRAISING,
                        ProjectStatus.FUNDED,
                        ProjectStatus.IN_PROGRESS,
                        ProjectStatus.COMPLETED,
                    ]
                )
            )
            .order_by(Project.created_at.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def list_by_author(self, author_id: int) -> list[Project]:
        statement = (
            select(Project)
            .options(*self._project_options())
            .where(Project.author_id == author_id)
            .order_by(Project.created_at.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def create_draft(self, *, author_id: int, data: ProjectCreate) -> Project:
        project = Project(
            author_id=author_id,
            slug=data.slug,
            project_type=data.project_type,
            funding_type=data.funding_type,
            city=data.city,
            goal_amount=data.goal_amount,
            currency=data.currency,
            deadline=data.deadline,
            status=ProjectStatus.DRAFT,
        )

        project.translations = [
            ProjectTranslation(**translation.model_dump())
            for translation in data.translations
        ]

        if data.category_ids:
            project.categories = await self._get_categories_by_ids(data.category_ids)

        self.db.add(project)
        await self.db.flush()
        await self.db.refresh(project)

        return project

    async def update_project(self, project: Project, data: ProjectUpdate) -> Project:
        update_data = data.model_dump(exclude_unset=True, exclude={"translations", "category_ids"})

        for field, value in update_data.items():
            setattr(project, field, value)

        if data.translations is not None:
            project.translations.clear()
            await self.db.flush()

            project.translations = [
                ProjectTranslation(**translation.model_dump())
                for translation in data.translations
            ]

        if data.category_ids is not None:
            project.categories = await self._get_categories_by_ids(data.category_ids)

        return await self.save(project)

    async def save(self, project: Project) -> Project:
        self.db.add(project)
        await self.db.flush()
        await self.db.refresh(project)

        return project

    async def list_public_updates(self, project_id: int) -> list[ProjectUpdateItem]:
        statement = (
            select(ProjectUpdateItem)
            .where(
                ProjectUpdateItem.project_id == project_id,
                ProjectUpdateItem.is_public.is_(True),
            )
            .order_by(ProjectUpdateItem.created_at.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_updates_for_author(self, project_id: int) -> list[ProjectUpdateItem]:
        statement = (
            select(ProjectUpdateItem)
            .where(ProjectUpdateItem.project_id == project_id)
            .order_by(ProjectUpdateItem.created_at.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create_update(
        self,
        *,
        project_id: int,
        author_id: int,
        language: str,
        title: str,
        text: str,
        is_public: bool,
    ) -> ProjectUpdateItem:
        project_update = ProjectUpdateItem(
            project_id=project_id,
            author_id=author_id,
            language=language,
            title=title,
            text=text,
            is_public=is_public,
        )

        self.db.add(project_update)
        await self.db.flush()
        await self.db.refresh(project_update)

        return project_update

    async def _get_categories_by_ids(self, category_ids: list[int]) -> list[Category]:
        if not category_ids:
            return []

        statement = (
            select(Category)
            .options(selectinload(Category.translations))
            .where(Category.id.in_(category_ids))
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())
