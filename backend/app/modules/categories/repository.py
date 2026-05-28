from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.categories.model import Category, CategoryTranslation


class CategoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, category_id: int) -> Category | None:
        statement = select(Category).where(Category.id == category_id)
        return self.db.scalar(statement)

    def get_by_slug(self, slug: str) -> Category | None:
        statement = select(Category).where(Category.slug == slug)
        return self.db.scalar(statement)

    def list_active(self) -> list[Category]:
        statement = (
            select(Category)
            .where(Category.is_active.is_(True))
            .order_by(Category.sort_order.asc(), Category.id.asc())
        )
        return list(self.db.scalars(statement).all())

    def create(
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
        self.db.flush()
        self.db.refresh(category)

        return category
