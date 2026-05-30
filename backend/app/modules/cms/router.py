from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.modules.cms.schema import CMSPageRead
from app.modules.cms.service import CMSPageService

router = APIRouter(prefix="/cms", tags=["cms"])


@router.get("/pages", response_model=list[CMSPageRead])
async def list_public_cms_pages(
    db: AsyncSession = Depends(get_database_session),
) -> list[CMSPageRead]:
    service = CMSPageService(db)
    return await service.list_published()


@router.get("/pages/{slug}", response_model=CMSPageRead)
async def get_public_cms_page(
    slug: str,
    db: AsyncSession = Depends(get_database_session),
) -> CMSPageRead:
    service = CMSPageService(db)
    return await service.get_public_by_slug(slug)
