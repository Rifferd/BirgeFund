from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.modules.banners.schema import BannerRead
from app.modules.banners.service import BannerService
from app.shared.enums import BannerPlacement

router = APIRouter(prefix="/banners", tags=["banners"])


@router.get("", response_model=list[BannerRead])
def list_public_banners(
    placement: BannerPlacement | None = Query(default=None),
    db: Session = Depends(get_database_session),
) -> list[BannerRead]:
    service = BannerService(db)
    return service.list_public(placement=placement)
