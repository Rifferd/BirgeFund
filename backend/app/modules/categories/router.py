from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.modules.categories.schema import CategoryCreate, CategoryRead
from app.modules.categories.service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(
    db: Session = Depends(get_database_session),
) -> list[CategoryRead]:
    service = CategoryService(db)
    return service.list_active()


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_database_session),
) -> CategoryRead:
    service = CategoryService(db)
    return service.create(payload)
