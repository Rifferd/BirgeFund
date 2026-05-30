from datetime import datetime

from pydantic import Field

from app.shared.enums import BannerPlacement
from app.shared.schemas import BaseSchema


class BannerTranslationBase(BaseSchema):
    language: str = Field(max_length=10)
    title: str = Field(min_length=2, max_length=255)
    subtitle: str | None = None
    cta_text: str | None = Field(default=None, max_length=100)


class BannerTranslationCreate(BannerTranslationBase):
    pass


class BannerTranslationRead(BannerTranslationBase):
    id: int
    banner_id: int
    created_at: datetime
    updated_at: datetime | None


class BannerCreate(BaseSchema):
    slug: str = Field(min_length=2, max_length=150)
    placement: BannerPlacement
    image_file_id: int | None = None
    link_url: str | None = Field(default=None, max_length=500)
    sort_order: int = 0
    is_active: bool = True
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    translations: list[BannerTranslationCreate] = Field(min_length=1)


class BannerUpdate(BaseSchema):
    slug: str | None = Field(default=None, min_length=2, max_length=150)
    placement: BannerPlacement | None = None
    image_file_id: int | None = None
    link_url: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    is_active: bool | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    translations: list[BannerTranslationCreate] | None = None


class BannerRead(BaseSchema):
    id: int
    slug: str
    placement: BannerPlacement
    image_file_id: int | None
    link_url: str | None
    sort_order: int
    is_active: bool
    starts_at: datetime | None
    ends_at: datetime | None
    created_at: datetime
    updated_at: datetime | None
    translations: list[BannerTranslationRead] = Field(default_factory=list)
