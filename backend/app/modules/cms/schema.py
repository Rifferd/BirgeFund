from datetime import datetime

from pydantic import Field

from app.shared.schemas import BaseSchema


class CMSPageTranslationBase(BaseSchema):
    language: str = Field(max_length=10)
    title: str = Field(min_length=2, max_length=255)
    content: str = Field(min_length=10)
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)


class CMSPageTranslationCreate(CMSPageTranslationBase):
    pass


class CMSPageTranslationRead(CMSPageTranslationBase):
    id: int
    page_id: int
    created_at: datetime
    updated_at: datetime | None


class CMSPageCreate(BaseSchema):
    slug: str = Field(min_length=2, max_length=150)
    is_published: bool = False
    translations: list[CMSPageTranslationCreate] = Field(min_length=1)


class CMSPageUpdate(BaseSchema):
    slug: str | None = Field(default=None, min_length=2, max_length=150)
    is_published: bool | None = None
    translations: list[CMSPageTranslationCreate] | None = None


class CMSPageRead(BaseSchema):
    id: int
    slug: str
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime | None
    translations: list[CMSPageTranslationRead] = Field(default_factory=list)
