from datetime import UTC, datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.banners.model import Banner, BannerTranslation
from app.modules.banners.schema import BannerCreate, BannerUpdate
from app.shared.enums import BannerPlacement


class BannerRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, banner_id: int) -> Banner | None:
        statement = select(Banner).where(Banner.id == banner_id)
        return self.db.scalar(statement)

    def get_by_slug(self, slug: str) -> Banner | None:
        statement = select(Banner).where(Banner.slug == slug)
        return self.db.scalar(statement)

    def list_all(self) -> list[Banner]:
        statement = select(Banner).order_by(Banner.created_at.desc(), Banner.id.desc())
        return list(self.db.scalars(statement).all())

    def list_public(self, placement: BannerPlacement | None = None) -> list[Banner]:
        now = datetime.now(UTC)

        statement = select(Banner).where(
            Banner.is_active.is_(True),
            or_(Banner.starts_at.is_(None), Banner.starts_at <= now),
            or_(Banner.ends_at.is_(None), Banner.ends_at >= now),
        )

        if placement is not None:
            statement = statement.where(Banner.placement == placement)

        statement = statement.order_by(Banner.sort_order.asc(), Banner.id.desc())

        return list(self.db.scalars(statement).all())

    def create(self, data: BannerCreate) -> Banner:
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
        self.db.flush()
        self.db.refresh(banner)

        return banner

    def update(self, banner: Banner, data: BannerUpdate) -> Banner:
        update_data = data.model_dump(exclude_unset=True, exclude={"translations"})

        for field, value in update_data.items():
            setattr(banner, field, value)

        if data.translations is not None:
            banner.translations.clear()
            self.db.flush()

            banner.translations = [
                BannerTranslation(**translation.model_dump())
                for translation in data.translations
            ]

        self.db.add(banner)
        self.db.flush()
        self.db.refresh(banner)

        return banner
