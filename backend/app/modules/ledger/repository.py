from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.ledger.model import LedgerEntry
from app.modules.ledger.schema import LedgerEntryCreate
from app.shared.enums import LedgerEntryStatus, LedgerEntryType


class LedgerEntryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, ledger_entry_id: int) -> LedgerEntry | None:
        statement = select(LedgerEntry).where(LedgerEntry.id == ledger_entry_id)
        return self.db.scalar(statement)

    def list_by_project(self, project_id: int) -> list[LedgerEntry]:
        statement = (
            select(LedgerEntry)
            .where(LedgerEntry.project_id == project_id)
            .order_by(LedgerEntry.created_at.desc(), LedgerEntry.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_by_user(self, user_id: int) -> list[LedgerEntry]:
        statement = (
            select(LedgerEntry)
            .where(LedgerEntry.user_id == user_id)
            .order_by(LedgerEntry.created_at.desc(), LedgerEntry.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def create(self, data: LedgerEntryCreate) -> LedgerEntry:
        ledger_entry = LedgerEntry(**data.model_dump())

        self.db.add(ledger_entry)
        self.db.flush()
        self.db.refresh(ledger_entry)

        return ledger_entry

    def sum_by_project_and_type(
        self,
        *,
        project_id: int,
        entry_type: LedgerEntryType,
    ) -> Decimal:
        statement = select(func.coalesce(func.sum(LedgerEntry.amount), 0)).where(
            LedgerEntry.project_id == project_id,
            LedgerEntry.type == entry_type,
            LedgerEntry.status == LedgerEntryStatus.POSTED,
        )

        return Decimal(str(self.db.scalar(statement) or 0))
