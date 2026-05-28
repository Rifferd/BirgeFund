from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.categories.model import Category
from app.modules.projects.model import Project, ProjectTranslation
from app.modules.projects.schema import ProjectCreate, ProjectUpdate
from app.shared.enums import ProjectStatus


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, project_id: int) -> Project | None:
        statement = select(Project).where(Project.id == project_id)
        return self.db.scalar(statement)

    def get_by_slug(self, slug: str) -> Project | None:
        statement = select(Project).where(Project.slug == slug)
        return self.db.scalar(statement)

    def list_public(self) -> list[Project]:
        statement = (
            select(Project)
            .where(Project.status.in_([ProjectStatus.FUNDRAISING, ProjectStatus.FUNDED, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED]))
            .order_by(Project.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_by_author(self, author_id: int) -> list[Project]:
        statement = (
            select(Project)
            .where(Project.author_id == author_id)
            .order_by(Project.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def create_draft(self, *, author_id: int, data: ProjectCreate) -> Project:
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
            categories = self._get_categories_by_ids(data.category_ids)
            project.categories = categories

        self.db.add(project)
        self.db.flush()
        self.db.refresh(project)

        return project

    def update_project(self, project: Project, data: ProjectUpdate) -> Project:
        update_data = data.model_dump(exclude_unset=True, exclude={"translations", "category_ids"})

        for field, value in update_data.items():
            setattr(project, field, value)

        if data.translations is not None:
            project.translations.clear()
            self.db.flush()

            project.translations = [
                ProjectTranslation(**translation.model_dump())
                for translation in data.translations
            ]

        if data.category_ids is not None:
            project.categories = self._get_categories_by_ids(data.category_ids)

        self.db.add(project)
        self.db.flush()
        self.db.refresh(project)

        return project

    def _get_categories_by_ids(self, category_ids: list[int]) -> list[Category]:
        if not category_ids:
            return []

        statement = select(Category).where(Category.id.in_(category_ids))
        return list(self.db.scalars(statement).all())
