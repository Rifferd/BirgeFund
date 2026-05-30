from datetime import datetime

from pydantic import Field

from app.shared.schemas import BaseSchema


class CategoryTranslationBase(BaseSchema):
    language: str = Field(max_length=10)
    name: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)


class CategoryTranslationCreate(CategoryTranslationBase):
    pass


class CategoryTranslationRead(CategoryTranslationBase):
    id: int
    category_id: int
    created_at: datetime
    updated_at: datetime | None


class CategoryBase(BaseSchema):
    slug: str = Field(min_length=2, max_length=120)
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    translations: list[CategoryTranslationCreate] = Field(min_length=1)


class CategoryUpdate(BaseSchema):
    slug: str | None = Field(default=None, min_length=2, max_length=120)
    sort_order: int | None = None
    is_active: bool | None = None
    translations: list[CategoryTranslationCreate] | None = None


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime | None
    translations: list[CategoryTranslationRead] = Field(default_factory=list)
