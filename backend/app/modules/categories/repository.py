from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.categories.model import Category, CategoryTranslation


class CategoryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, category_id: int) -> Category | None:
        statement = (
            select(Category)
            .options(selectinload(Category.translations))
            .where(Category.id == category_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Category | None:
        statement = (
            select(Category)
            .options(selectinload(Category.translations))
            .where(Category.slug == slug)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_active(self) -> list[Category]:
        statement = (
            select(Category)
            .options(selectinload(Category.translations))
            .where(Category.is_active.is_(True))
            .order_by(Category.sort_order.asc(), Category.id.asc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def create(
        self,
        *,
        slug: str,
        sort_order: int = 0,
        is_active: bool = True,
        translations: list[dict],
    ) -> Category:
        category = Category(
            slug=slug,
            sort_order=sort_order,
            is_active=is_active,
        )

        for item in translations:
            category.translations.append(
                CategoryTranslation(
                    language=item["language"],
                    name=item["name"],
                    description=item.get("description"),
                )
            )

        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)

        return category
