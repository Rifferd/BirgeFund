from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database_session
from app.modules.categories.schema import CategoryCreate, CategoryRead
from app.modules.categories.service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
async def list_categories(
    db: AsyncSession = Depends(get_database_session),
) -> list[CategoryRead]:
    service = CategoryService(db)
    return await service.list_active()


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_database_session),
) -> CategoryRead:
    service = CategoryService(db)
    return await service.create(payload)
