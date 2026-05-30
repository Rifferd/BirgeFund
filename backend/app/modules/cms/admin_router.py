from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.cms.schema import CMSPageCreate, CMSPageRead, CMSPageUpdate
from app.modules.cms.service import CMSPageService
from app.modules.users.model import User

router = APIRouter(prefix="/admin/cms", tags=["admin-cms"])


@router.get("/pages", response_model=list[CMSPageRead])
def list_admin_cms_pages(
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: Session = Depends(get_database_session),
) -> list[CMSPageRead]:
    service = CMSPageService(db)
    return service.list_all()


@router.get("/pages/{page_id}", response_model=CMSPageRead)
def get_admin_cms_page(
    page_id: int,
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: Session = Depends(get_database_session),
) -> CMSPageRead:
    service = CMSPageService(db)
    return service.get_by_id(page_id)


@router.post("/pages", response_model=CMSPageRead)
def create_admin_cms_page(
    payload: CMSPageCreate,
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: Session = Depends(get_database_session),
) -> CMSPageRead:
    service = CMSPageService(db)
    return service.create(data=payload, current_user=current_user)


@router.patch("/pages/{page_id}", response_model=CMSPageRead)
def update_admin_cms_page(
    page_id: int,
    payload: CMSPageUpdate,
    current_user: User = Depends(require_permission(Permissions.CMS_UPDATE)),
    db: Session = Depends(get_database_session),
) -> CMSPageRead:
    service = CMSPageService(db)
    return service.update(
        page_id=page_id,
        data=payload,
        current_user=current_user,
    )
