from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database_session
from app.modules.payments.schema import (
    MockPaymentConfirmRequest,
    MockPaymentCreateRequest,
    PaymentAttemptRead,
    PlatformFeeRuleCreate,
    PlatformFeeRuleRead,
)
from app.modules.payments.service import PaymentService, PlatformFeeService
from app.modules.users.model import User

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post(
    "/mock/create",
    response_model=PaymentAttemptRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_mock_payment(
    payload: MockPaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> PaymentAttemptRead:
    service = PaymentService(db)
    return await service.create_mock_payment(
        current_user=current_user,
        data=payload,
    )


@router.post("/mock/confirm", response_model=PaymentAttemptRead)
async def confirm_mock_payment(
    payload: MockPaymentConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> PaymentAttemptRead:
    service = PaymentService(db)
    return await service.confirm_mock_payment(
        current_user=current_user,
        payment_attempt_id=payload.payment_attempt_id,
    )


@router.get("/my", response_model=list[PaymentAttemptRead])
async def list_my_payments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> list[PaymentAttemptRead]:
    service = PaymentService(db)
    return await service.list_my_payments(current_user)


@router.get("/fee-rules", response_model=list[PlatformFeeRuleRead])
async def list_fee_rules(
    db: AsyncSession = Depends(get_database_session),
) -> list[PlatformFeeRuleRead]:
    service = PlatformFeeService(db)
    return await service.list_rules()


@router.post(
    "/fee-rules/defaults",
    response_model=list[PlatformFeeRuleRead],
    status_code=status.HTTP_201_CREATED,
)
async def create_default_fee_rules(
    db: AsyncSession = Depends(get_database_session),
) -> list[PlatformFeeRuleRead]:
    service = PlatformFeeService(db)
    return await service.create_default_rules()


@router.put("/fee-rules", response_model=PlatformFeeRuleRead)
async def upsert_fee_rule(
    payload: PlatformFeeRuleCreate,
    db: AsyncSession = Depends(get_database_session),
) -> PlatformFeeRuleRead:
    service = PlatformFeeService(db)
    return await service.upsert_rule(payload)
