from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.audit.service import AuditLogService
from app.modules.translations.model import StaticTranslation
from app.modules.translations.repository import StaticTranslationRepository
from app.modules.translations.schema import (
    StaticTranslationCreate,
    StaticTranslationUpdate,
    TranslationDictionaryResponse,
    TranslationSeedResponse,
)
from app.modules.users.model import User


DEFAULT_STATIC_TRANSLATIONS = [
    StaticTranslationCreate(
        namespace="common",
        key="app.name",
        ru="BirgeFund",
        kg="BirgeFund",
        en="BirgeFund",
        description="Название платформы",
    ),
    StaticTranslationCreate(
        namespace="common",
        key="test_mode.notice",
        ru="Платформа работает в тестовом режиме. Реальные платежи не принимаются.",
        kg="Платформа тест режиминде иштейт. Чыныгы төлөмдөр кабыл алынбайт.",
        en="The platform works in test mode. Real payments are not accepted.",
        description="Глобальное уведомление о test mode",
    ),
    StaticTranslationCreate(
        namespace="navigation",
        key="projects",
        ru="Проекты",
        kg="Долбоорлор",
        en="Projects",
    ),
    StaticTranslationCreate(
        namespace="navigation",
        key="categories",
        ru="Категории",
        kg="Категориялар",
        en="Categories",
    ),
    StaticTranslationCreate(
        namespace="navigation",
        key="about",
        ru="О платформе",
        kg="Платформа жөнүндө",
        en="About",
    ),
    StaticTranslationCreate(
        namespace="projects",
        key="support_project",
        ru="Поддержать проект",
        kg="Долбоорду колдоо",
        en="Support project",
    ),
    StaticTranslationCreate(
        namespace="projects",
        key="collected",
        ru="Собрано",
        kg="Чогултулду",
        en="Collected",
    ),
    StaticTranslationCreate(
        namespace="projects",
        key="goal",
        ru="Цель",
        kg="Максат",
        en="Goal",
    ),
    StaticTranslationCreate(
        namespace="payments",
        key="mock_payment_warning",
        ru="Это тестовая оплата. Деньги не списываются.",
        kg="Бул тесттик төлөм. Акча алынбайт.",
        en="This is a test payment. No money will be charged.",
    ),
]


class StaticTranslationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.translations = StaticTranslationRepository(db)
        self.audit = AuditLogService(db)

    async def get_dictionary(
        self,
        *,
        language: str,
        namespace: str | None = None,
    ) -> TranslationDictionaryResponse:
        rows = await self.translations.list_active(namespace=namespace)

        items: dict[str, str] = {}

        for row in rows:
            value = self._get_value_by_language(row, language)
            dict_key = row.key if namespace is not None else f"{row.namespace}.{row.key}"
            items[dict_key] = value

        return TranslationDictionaryResponse(
            language=language,
            namespace=namespace,
            items=items,
        )

    async def list_all(self) -> list[StaticTranslation]:
        return await self.translations.list_all()

    async def get_by_id(self, translation_id: int) -> StaticTranslation:
        translation = await self.translations.get_by_id(translation_id)

        if translation is None:
            raise NotFoundException("Перевод не найден")

        return translation

    async def create(self, *, data: StaticTranslationCreate, current_user: User) -> StaticTranslation:
        if await self.translations.get_by_namespace_and_key(data.namespace, data.key) is not None:
            raise ConflictException("Перевод с таким namespace/key уже существует")

        translation = await self.translations.create(data)

        await self.audit.create_log(
            action="translation.created",
            entity_type="static_translation",
            entity_id=translation.id,
            actor=current_user,
            new_values={
                "namespace": translation.namespace,
                "key": translation.key,
                "is_active": translation.is_active,
            },
        )

        await self.db.commit()
        await self.db.refresh(translation)

        return translation

    async def update(
        self,
        *,
        translation_id: int,
        data: StaticTranslationUpdate,
        current_user: User,
    ) -> StaticTranslation:
        translation = await self.get_by_id(translation_id)

        old_values = {
            "namespace": translation.namespace,
            "key": translation.key,
            "ru": translation.ru,
            "kg": translation.kg,
            "en": translation.en,
            "is_active": translation.is_active,
        }

        target_namespace = data.namespace if data.namespace is not None else translation.namespace
        target_key = data.key if data.key is not None else translation.key

        existing_translation = await self.translations.get_by_namespace_and_key(
            target_namespace,
            target_key,
        )

        if existing_translation is not None and existing_translation.id != translation.id:
            raise ConflictException("Перевод с таким namespace/key уже существует")

        translation = await self.translations.update(translation, data)

        await self.audit.create_log(
            action="translation.updated",
            entity_type="static_translation",
            entity_id=translation.id,
            actor=current_user,
            old_values=old_values,
            new_values={
                "namespace": translation.namespace,
                "key": translation.key,
                "ru": translation.ru,
                "kg": translation.kg,
                "en": translation.en,
                "is_active": translation.is_active,
            },
        )

        await self.db.commit()
        await self.db.refresh(translation)

        return translation

    async def seed_defaults(self, current_user: User) -> TranslationSeedResponse:
        created_count = 0
        existing_count = 0

        for translation_data in DEFAULT_STATIC_TRANSLATIONS:
            existing_translation = await self.translations.get_by_namespace_and_key(
                translation_data.namespace,
                translation_data.key,
            )

            if existing_translation is not None:
                existing_count += 1
                continue

            await self.translations.create(translation_data)
            created_count += 1

        await self.audit.create_log(
            action="translation.defaults_seeded",
            entity_type="static_translation",
            actor=current_user,
            new_values={
                "created_count": created_count,
                "existing_count": existing_count,
                "total_count": len(DEFAULT_STATIC_TRANSLATIONS),
            },
        )

        await self.db.commit()

        return TranslationSeedResponse(
            created_count=created_count,
            existing_count=existing_count,
            total_count=len(DEFAULT_STATIC_TRANSLATIONS),
        )

    def _get_value_by_language(self, translation: StaticTranslation, language: str) -> str:
        if language == "kg" and translation.kg:
            return translation.kg

        if language == "en" and translation.en:
            return translation.en

        return translation.ru
