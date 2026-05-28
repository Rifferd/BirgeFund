from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

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
def create_mock_payment(
    payload: MockPaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> PaymentAttemptRead:
    service = PaymentService(db)
    return service.create_mock_payment(
        current_user=current_user,
        data=payload,
    )


@router.post("/mock/confirm", response_model=PaymentAttemptRead)
def confirm_mock_payment(
    payload: MockPaymentConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> PaymentAttemptRead:
    service = PaymentService(db)
    return service.confirm_mock_payment(
        current_user=current_user,
        payment_attempt_id=payload.payment_attempt_id,
    )


@router.get("/my", response_model=list[PaymentAttemptRead])
def list_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> list[PaymentAttemptRead]:
    service = PaymentService(db)
    return service.list_my_payments(current_user)


@router.get("/fee-rules", response_model=list[PlatformFeeRuleRead])
def list_fee_rules(
    db: Session = Depends(get_database_session),
) -> list[PlatformFeeRuleRead]:
    service = PlatformFeeService(db)
    return service.list_rules()


@router.post(
    "/fee-rules/defaults",
    response_model=list[PlatformFeeRuleRead],
    status_code=status.HTTP_201_CREATED,
)
def create_default_fee_rules(
    db: Session = Depends(get_database_session),
) -> list[PlatformFeeRuleRead]:
    service = PlatformFeeService(db)
    return service.create_default_rules()


@router.put("/fee-rules", response_model=PlatformFeeRuleRead)
def upsert_fee_rule(
    payload: PlatformFeeRuleCreate,
    db: Session = Depends(get_database_session),
) -> PlatformFeeRuleRead:
    service = PlatformFeeService(db)
    return service.upsert_rule(payload)
