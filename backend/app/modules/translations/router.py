from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.modules.translations.schema import TranslationDictionaryResponse
from app.modules.translations.service import StaticTranslationService

router = APIRouter(prefix="/translations", tags=["translations"])


@router.get("", response_model=TranslationDictionaryResponse)
async def get_translations_dictionary(
    language: str = Query(default="ru", pattern="^(ru|kg|en)$"),
    namespace: str | None = Query(default=None),
    db: AsyncSession = Depends(get_database_session),
) -> TranslationDictionaryResponse:
    service = StaticTranslationService(db)
    return await service.get_dictionary(
        language=language,
        namespace=namespace,
    )
