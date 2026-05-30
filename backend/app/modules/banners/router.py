from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.modules.banners.schema import BannerRead
from app.modules.banners.service import BannerService
from app.shared.enums import BannerPlacement

router = APIRouter(prefix="/banners", tags=["banners"])


@router.get("", response_model=list[BannerRead])
async def list_public_banners(
    placement: BannerPlacement | None = Query(default=None),
    db: AsyncSession = Depends(get_database_session),
) -> list[BannerRead]:
    service = BannerService(db)
    return await service.list_public(placement=placement)
