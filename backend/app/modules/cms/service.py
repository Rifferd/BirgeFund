from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.modules.audit.service import AuditLogService
from app.modules.cms.model import CMSPage
from app.modules.cms.repository import CMSPageRepository
from app.modules.cms.schema import CMSPageCreate, CMSPageTranslationCreate, CMSPageUpdate
from app.modules.users.model import User


class CMSPageService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.pages = CMSPageRepository(db)
        self.audit = AuditLogService(db)

    async def list_published(self) -> list[CMSPage]:
        return await self.pages.list_published()

    async def list_all(self) -> list[CMSPage]:
        return await self.pages.list_all()

    async def get_public_by_slug(self, slug: str) -> CMSPage:
        page = await self.pages.get_by_slug(slug)

        if page is None or not page.is_published:
            raise NotFoundException("Страница не найдена")

        return page

    async def get_by_id(self, page_id: int) -> CMSPage:
        page = await self.pages.get_by_id(page_id)

        if page is None:
            raise NotFoundException("Страница не найдена")

        return page

    async def create(self, *, data: CMSPageCreate, current_user: User) -> CMSPage:
        if await self.pages.get_by_slug(data.slug) is not None:
            raise ConflictException("CMS-страница с таким slug уже существует")

        self._validate_translations(data.translations)

        page = await self.pages.create(data)

        await self.audit.create_log(
            action="cms.page_created",
            entity_type="cms_page",
            entity_id=page.id,
            actor=current_user,
            new_values={
                "slug": page.slug,
                "is_published": page.is_published,
            },
        )

        await self.db.commit()
        await self.db.refresh(page)

        return page

    async def update(self, *, page_id: int, data: CMSPageUpdate, current_user: User) -> CMSPage:
        page = await self.get_by_id(page_id)

        old_values = {
            "slug": page.slug,
            "is_published": page.is_published,
        }

        if data.slug is not None:
            existing_page = await self.pages.get_by_slug(data.slug)
            if existing_page is not None and existing_page.id != page.id:
                raise ConflictException("CMS-страница с таким slug уже существует")

        if data.translations is not None:
            self._validate_translations(data.translations)

        page = await self.pages.update(page, data)

        await self.audit.create_log(
            action="cms.page_updated",
            entity_type="cms_page",
            entity_id=page.id,
            actor=current_user,
            old_values=old_values,
            new_values={
                "slug": page.slug,
                "is_published": page.is_published,
            },
        )

        await self.db.commit()
        await self.db.refresh(page)

        return page

    def _validate_translations(self, translations: list[CMSPageTranslationCreate]) -> None:
        languages = [translation.language for translation in translations]

        if "ru" not in languages:
            raise BadRequestException("Русский перевод обязателен")

        if len(languages) != len(set(languages)):
            raise BadRequestException("Нельзя добавлять два перевода на одном языке")
