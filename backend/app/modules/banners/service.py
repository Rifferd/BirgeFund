from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.modules.audit.service import AuditLogService
from app.modules.banners.model import Banner
from app.modules.banners.repository import BannerRepository
from app.modules.banners.schema import BannerCreate, BannerTranslationCreate, BannerUpdate
from app.modules.files.repository import FileRepository
from app.modules.users.model import User
from app.shared.enums import BannerPlacement


class BannerService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.banners = BannerRepository(db)
        self.files = FileRepository(db)
        self.audit = AuditLogService(db)

    async def list_public(self, placement: BannerPlacement | None = None) -> list[Banner]:
        return await self.banners.list_public(placement=placement)

    async def list_all(self) -> list[Banner]:
        return await self.banners.list_all()

    async def get_by_id(self, banner_id: int) -> Banner:
        banner = await self.banners.get_by_id(banner_id)

        if banner is None:
            raise NotFoundException("Баннер не найден")

        return banner

    async def create(self, *, data: BannerCreate, current_user: User) -> Banner:
        if await self.banners.get_by_slug(data.slug) is not None:
            raise ConflictException("Баннер с таким slug уже существует")

        self._validate_translations(data.translations)
        self._validate_date_range(data.starts_at, data.ends_at)
        await self._validate_image_file(data.image_file_id)

        banner = await self.banners.create(data)

        await self.audit.create_log(
            action="cms.banner_created",
            entity_type="banner",
            entity_id=banner.id,
            actor=current_user,
            new_values={
                "slug": banner.slug,
                "placement": banner.placement.value,
                "is_active": banner.is_active,
            },
        )

        await self.db.commit()
        await self.db.refresh(banner)

        return banner

    async def update(self, *, banner_id: int, data: BannerUpdate, current_user: User) -> Banner:
        banner = await self.get_by_id(banner_id)

        old_values = {
            "slug": banner.slug,
            "placement": banner.placement.value,
            "is_active": banner.is_active,
            "sort_order": banner.sort_order,
        }

        if data.slug is not None:
            existing_banner = await self.banners.get_by_slug(data.slug)
            if existing_banner is not None and existing_banner.id != banner.id:
                raise ConflictException("Баннер с таким slug уже существует")

        if data.translations is not None:
            self._validate_translations(data.translations)

        self._validate_date_range(data.starts_at, data.ends_at)

        if data.image_file_id is not None:
            await self._validate_image_file(data.image_file_id)

        banner = await self.banners.update(banner, data)

        await self.audit.create_log(
            action="cms.banner_updated",
            entity_type="banner",
            entity_id=banner.id,
            actor=current_user,
            old_values=old_values,
            new_values={
                "slug": banner.slug,
                "placement": banner.placement.value,
                "is_active": banner.is_active,
                "sort_order": banner.sort_order,
            },
        )

        await self.db.commit()
        await self.db.refresh(banner)

        return banner

    def _validate_translations(self, translations: list[BannerTranslationCreate]) -> None:
        languages = [translation.language for translation in translations]

        if "ru" not in languages:
            raise BadRequestException("Русский перевод обязателен")

        if len(languages) != len(set(languages)):
            raise BadRequestException("Нельзя добавлять два перевода на одном языке")

    def _validate_date_range(self, starts_at, ends_at) -> None:
        if starts_at is not None and ends_at is not None and starts_at >= ends_at:
            raise BadRequestException("Дата начала должна быть раньше даты окончания")

    async def _validate_image_file(self, image_file_id: int | None) -> None:
        if image_file_id is None:
            return

        file = await self.files.get_by_id(image_file_id)

        if file is None:
            raise BadRequestException("Файл изображения не найден")

        if file.mime_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise BadRequestException("Для баннера можно использовать только изображение")
