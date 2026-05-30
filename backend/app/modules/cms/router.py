from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.modules.cms.schema import CMSPageRead
from app.modules.cms.service import CMSPageService

router = APIRouter(prefix="/cms", tags=["cms"])


@router.get("/pages", response_model=list[CMSPageRead])
def list_public_cms_pages(
    db: Session = Depends(get_database_session),
) -> list[CMSPageRead]:
    service = CMSPageService(db)
    return service.list_published()


@router.get("/pages/{slug}", response_model=CMSPageRead)
def get_public_cms_page(
    slug: str,
    db: Session = Depends(get_database_session),
) -> CMSPageRead:
    service = CMSPageService(db)
    return service.get_public_by_slug(slug)
