from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.modules.payments.schema import PlatformFeeRuleCreate, PlatformFeeRuleRead
from app.modules.payments.service import PlatformFeeService

router = APIRouter(prefix="/payments", tags=["payments"])


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
