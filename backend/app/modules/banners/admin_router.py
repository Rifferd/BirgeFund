from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.banners.schema import BannerCreate, BannerRead, BannerUpdate
from app.modules.banners.service import BannerService
from app.modules.users.model import User

router = APIRouter(prefix="/admin/banners", tags=["admin-banners"])


@router.get("", response_model=list[BannerRead])
async def list_admin_banners(
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> list[BannerRead]:
    service = BannerService(db)
    return await service.list_all()


@router.get("/{banner_id}", response_model=BannerRead)
async def get_admin_banner(
    banner_id: int,
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> BannerRead:
    service = BannerService(db)
    return await service.get_by_id(banner_id)


@router.post("", response_model=BannerRead)
async def create_admin_banner(
    payload: BannerCreate,
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> BannerRead:
    service = BannerService(db)
    return await service.create(data=payload, current_user=current_user)


@router.patch("/{banner_id}", response_model=BannerRead)
async def update_admin_banner(
    banner_id: int,
    payload: BannerUpdate,
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: AsyncSession = Depends(get_database_session),
) -> BannerRead:
    service = BannerService(db)
    return await service.update(
        banner_id=banner_id,
        data=payload,
        current_user=current_user,
    )
