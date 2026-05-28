from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database_session
from app.modules.ledger.schema import LedgerEntryRead, ProjectLedgerSummary
from app.modules.ledger.service import LedgerService
from app.modules.users.model import User

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/projects/{project_id}", response_model=list[LedgerEntryRead])
def list_project_ledger(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> list[LedgerEntryRead]:
    service = LedgerService(db)
    return service.list_by_project(project_id)


@router.get("/projects/{project_id}/summary", response_model=ProjectLedgerSummary)
def get_project_ledger_summary(
    project_id: int,
    db: Session = Depends(get_database_session),
) -> ProjectLedgerSummary:
    service = LedgerService(db)
    return service.get_project_summary(project_id)


@router.get("/my", response_model=list[LedgerEntryRead])
def list_my_ledger_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> list[LedgerEntryRead]:
    service = LedgerService(db)
    return service.list_by_user(current_user.id)
