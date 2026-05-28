from decimal import Decimal

from sqlalchemy.orm import Session

from app.modules.ledger.model import LedgerEntry
from app.modules.ledger.repository import LedgerEntryRepository
from app.modules.ledger.schema import LedgerEntryCreate, ProjectLedgerSummary
from app.shared.enums import LedgerEntryType


class LedgerService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.ledger = LedgerEntryRepository(db)

    def create_entry(self, data: LedgerEntryCreate, *, commit: bool = False) -> LedgerEntry:
        entry = self.ledger.create(data)

        if commit:
            self.db.commit()
            self.db.refresh(entry)

        return entry

    def list_by_project(self, project_id: int) -> list[LedgerEntry]:
        return self.ledger.list_by_project(project_id)

    def list_by_user(self, user_id: int) -> list[LedgerEntry]:
        return self.ledger.list_by_user(user_id)

    def get_project_summary(self, project_id: int) -> ProjectLedgerSummary:
        project_gross = self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.PROJECT_GROSS,
        )
        project_net = self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.PROJECT_NET,
        )
        platform_fee = self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.PLATFORM_FEE,
        )
        refund = self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.REFUND,
        )

        return ProjectLedgerSummary(
            project_id=project_id,
            gross_collected=project_gross + refund,
            net_amount=project_net,
            platform_fee_amount=abs(platform_fee),
            refunded_amount=abs(refund),
            currency="KGS",
        )
