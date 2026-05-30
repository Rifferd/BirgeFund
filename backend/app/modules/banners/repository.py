from datetime import UTC, datetime

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.banners.model import Banner, BannerTranslation
from app.modules.banners.schema import BannerCreate, BannerUpdate
from app.shared.enums import BannerPlacement


class BannerRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _options(self):
        return (selectinload(Banner.translations),)

    async def get_by_id(self, banner_id: int) -> Banner | None:
        statement = (
            select(Banner)
            .options(*self._options())
            .where(Banner.id == banner_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Banner | None:
        statement = (
            select(Banner)
            .options(*self._options())
            .where(Banner.slug == slug)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Banner]:
        statement = (
            select(Banner)
            .options(*self._options())
            .order_by(Banner.created_at.desc(), Banner.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def list_public(self, placement: BannerPlacement | None = None) -> list[Banner]:
        now = datetime.now(UTC)

        statement = (
            select(Banner)
            .options(*self._options())
            .where(
                Banner.is_active.is_(True),
                or_(Banner.starts_at.is_(None), Banner.starts_at <= now),
                or_(Banner.ends_at.is_(None), Banner.ends_at >= now),
            )
        )

        if placement is not None:
            statement = statement.where(Banner.placement == placement)

        statement = statement.order_by(Banner.sort_order.asc(), Banner.id.desc())

        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def create(self, data: BannerCreate) -> Banner:
        banner = Banner(
            slug=data.slug,
            placement=data.placement,
            image_file_id=data.image_file_id,
            link_url=data.link_url,
            sort_order=data.sort_order,
            is_active=data.is_active,
            starts_at=data.starts_at,
            ends_at=data.ends_at,
        )

        banner.translations = [
            BannerTranslation(**translation.model_dump())
            for translation in data.translations
        ]

        self.db.add(banner)
        await self.db.flush()
        await self.db.refresh(banner)

        return banner

    async def update(self, banner: Banner, data: BannerUpdate) -> Banner:
        update_data = data.model_dump(exclude_unset=True, exclude={"translations"})

        for field, value in update_data.items():
            setattr(banner, field, value)

        if data.translations is not None:
            banner.translations.clear()
            await self.db.flush()

            banner.translations = [
                BannerTranslation(**translation.model_dump())
                for translation in data.translations
            ]

        self.db.add(banner)
        await self.db.flush()
        await self.db.refresh(banner)

        return banner
