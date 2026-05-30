from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.translations.schema import (
    StaticTranslationCreate,
    StaticTranslationRead,
    StaticTranslationUpdate,
    TranslationSeedResponse,
)
from app.modules.translations.service import StaticTranslationService
from app.modules.users.model import User

router = APIRouter(prefix="/admin/translations", tags=["admin-translations"])


@router.get("", response_model=list[StaticTranslationRead])
async def list_admin_translations(
    current_user: User = Depends(require_permission(Permissions.TRANSLATIONS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[StaticTranslationRead]:
    service = StaticTranslationService(db)
    return await service.list_all()


@router.post("/seed", response_model=TranslationSeedResponse)
async def seed_admin_translations(
    current_user: User = Depends(require_permission(Permissions.TRANSLATIONS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> TranslationSeedResponse:
    service = StaticTranslationService(db)
    return await service.seed_defaults(current_user)


@router.get("/{translation_id}", response_model=StaticTranslationRead)
async def get_admin_translation(
    translation_id: int,
    current_user: User = Depends(require_permission(Permissions.TRANSLATIONS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> StaticTranslationRead:
    service = StaticTranslationService(db)
    return await service.get_by_id(translation_id)


@router.post("", response_model=StaticTranslationRead)
async def create_admin_translation(
    payload: StaticTranslationCreate,
    current_user: User = Depends(require_permission(Permissions.TRANSLATIONS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> StaticTranslationRead:
    service = StaticTranslationService(db)
    return await service.create(
        data=payload,
        current_user=current_user,
    )


@router.patch("/{translation_id}", response_model=StaticTranslationRead)
async def update_admin_translation(
    translation_id: int,
    payload: StaticTranslationUpdate,
    current_user: User = Depends(require_permission(Permissions.TRANSLATIONS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> StaticTranslationRead:
    service = StaticTranslationService(db)
    return await service.update(
        translation_id=translation_id,
        data=payload,
        current_user=current_user,
    )
