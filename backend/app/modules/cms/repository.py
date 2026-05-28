from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.cms.model import CMSPage, CMSPageTranslation
from app.modules.cms.schema import CMSPageCreate, CMSPageUpdate


class CMSPageRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, page_id: int) -> CMSPage | None:
        statement = select(CMSPage).where(CMSPage.id == page_id)
        return self.db.scalar(statement)

    def get_by_slug(self, slug: str) -> CMSPage | None:
        statement = select(CMSPage).where(CMSPage.slug == slug)
        return self.db.scalar(statement)

    def list_all(self) -> list[CMSPage]:
        statement = select(CMSPage).order_by(CMSPage.created_at.desc(), CMSPage.id.desc())
        return list(self.db.scalars(statement).all())

    def list_published(self) -> list[CMSPage]:
        statement = (
            select(CMSPage)
            .where(CMSPage.is_published.is_(True))
            .order_by(CMSPage.published_at.desc(), CMSPage.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def create(self, data: CMSPageCreate) -> CMSPage:
        page = CMSPage(
            slug=data.slug,
            is_published=False,
        )

        for translation in data.translations:
            page.translations.append(
                CMSPageTranslation(**translation.model_dump())
            )

        if data.is_published:
            page.publish()

        self.db.add(page)
        self.db.flush()
        self.db.refresh(page)

        return page

    def update(self, page: CMSPage, data: CMSPageUpdate) -> CMSPage:
        update_data = data.model_dump(exclude_unset=True, exclude={"translations", "is_published"})

        for field, value in update_data.items():
            setattr(page, field, value)

        if data.translations is not None:
            page.translations.clear()
            self.db.flush()

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
        self.db.flush()
        self.db.refresh(page)

        return page
