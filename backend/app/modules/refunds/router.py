from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.refunds.schema import RefundCreateRequest, RefundRead
from app.modules.refunds.service import RefundService
from app.modules.users.model import User

router = APIRouter(tags=["refunds"])


@router.post("/payments/{payment_attempt_id}/refund", response_model=RefundRead)
async def create_test_refund(
    payment_attempt_id: int,
    payload: RefundCreateRequest,
    current_user: User = Depends(require_permission(Permissions.PAYMENTS_REFUND)),
    db: AsyncSession = Depends(get_database_session),
) -> RefundRead:
    service = RefundService(db)
    return await service.create_refund(
        payment_attempt_id=payment_attempt_id,
        reason=payload.reason,
        current_user=current_user,
    )


@router.get("/projects/{project_id}/refunds", response_model=list[RefundRead])
async def list_project_refunds(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> list[RefundRead]:
    service = RefundService(db)
    return await service.list_by_project(project_id)
