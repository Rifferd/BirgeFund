from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.cms.model import CMSPage, CMSPageTranslation
from app.modules.cms.schema import CMSPageCreate, CMSPageUpdate


class CMSPageRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _options(self):
        return (selectinload(CMSPage.translations),)

    async def get_by_id(self, page_id: int) -> CMSPage | None:
        statement = (
            select(CMSPage)
            .options(*self._options())
            .where(CMSPage.id == page_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> CMSPage | None:
        statement = (
            select(CMSPage)
            .options(*self._options())
            .where(CMSPage.slug == slug)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[CMSPage]:
        statement = (
            select(CMSPage)
            .options(*self._options())
            .order_by(CMSPage.created_at.desc(), CMSPage.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def list_published(self) -> list[CMSPage]:
        statement = (
            select(CMSPage)
            .options(*self._options())
            .where(CMSPage.is_published.is_(True))
            .order_by(CMSPage.published_at.desc(), CMSPage.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def create(self, data: CMSPageCreate) -> CMSPage:
        page = CMSPage(
            slug=data.slug,
            is_published=False,
        )

        for translation in data.translations:
            page.translations.append(CMSPageTranslation(**translation.model_dump()))

        if data.is_published:
            page.publish()

        self.db.add(page)
        await self.db.flush()
        await self.db.refresh(page)

        return page

    async def update(self, page: CMSPage, data: CMSPageUpdate) -> CMSPage:
        update_data = data.model_dump(exclude_unset=True, exclude={"translations", "is_published"})

        for field, value in update_data.items():
            setattr(page, field, value)

        if data.translations is not None:
            page.translations.clear()
            await self.db.flush()

            page.translations = [
                CMSPageTranslation(**translation.model_dump())
                for translation in data.translations
            ]

        if data.is_published is not None:
            if data.is_published:
                page.publish()
            else:
                page.unpublish()

        self.db.add(page)
        await self.db.flush()
        await self.db.refresh(page)

        return page
