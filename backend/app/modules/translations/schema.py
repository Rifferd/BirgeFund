from datetime import datetime

from pydantic import Field

from app.shared.schemas import BaseSchema


class StaticTranslationCreate(BaseSchema):
    namespace: str = Field(default="common", min_length=2, max_length=100)
    key: str = Field(min_length=2, max_length=200)
    ru: str = Field(min_length=1)
    kg: str | None = None
    en: str | None = None
    description: str | None = Field(default=None, max_length=500)
    is_active: bool = True


class StaticTranslationUpdate(BaseSchema):
    namespace: str | None = Field(default=None, min_length=2, max_length=100)
    key: str | None = Field(default=None, min_length=2, max_length=200)
    ru: str | None = Field(default=None, min_length=1)
    kg: str | None = None
    en: str | None = None
    description: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None


class StaticTranslationRead(BaseSchema):
    id: int
    namespace: str
    key: str
    ru: str
    kg: str | None
    en: str | None
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None


class TranslationDictionaryResponse(BaseSchema):
    language: str
    namespace: str | None
    items: dict[str, str]


class TranslationSeedResponse(BaseSchema):
    created_count: int
    existing_count: int
    total_count: int
