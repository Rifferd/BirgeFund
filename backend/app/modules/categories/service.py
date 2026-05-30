from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.categories.model import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schema import CategoryCreate


class CategoryService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.categories = CategoryRepository(db)

    async def list_active(self) -> list[Category]:
        return await self.categories.list_active()

    async def get_by_id(self, category_id: int) -> Category:
        category = await self.categories.get_by_id(category_id)

        if category is None:
            raise NotFoundException("Категория не найдена")

        return category

    async def create(self, data: CategoryCreate) -> Category:
        if await self.categories.get_by_slug(data.slug) is not None:
            raise ConflictException("Категория с таким slug уже существует")

        category = await self.categories.create(
            slug=data.slug,
            sort_order=data.sort_order,
            is_active=data.is_active,
            translations=[item.model_dump() for item in data.translations],
        )

        await self.db.commit()
        await self.db.refresh(category)

        return category
