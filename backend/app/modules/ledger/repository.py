from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ledger.model import LedgerEntry
from app.modules.ledger.schema import LedgerEntryCreate
from app.shared.enums import LedgerEntryStatus, LedgerEntryType


class LedgerEntryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, ledger_entry_id: int) -> LedgerEntry | None:
        statement = select(LedgerEntry).where(LedgerEntry.id == ledger_entry_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_project(self, project_id: int) -> list[LedgerEntry]:
        statement = (
            select(LedgerEntry)
            .where(LedgerEntry.project_id == project_id)
            .order_by(LedgerEntry.created_at.desc(), LedgerEntry.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_by_user(self, user_id: int) -> list[LedgerEntry]:
        statement = (
            select(LedgerEntry)
            .where(LedgerEntry.user_id == user_id)
            .order_by(LedgerEntry.created_at.desc(), LedgerEntry.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_by_payment_attempt(self, payment_attempt_id: int) -> list[LedgerEntry]:
        statement = (
            select(LedgerEntry)
            .where(LedgerEntry.payment_attempt_id == payment_attempt_id)
            .order_by(LedgerEntry.id.asc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create(self, data: LedgerEntryCreate) -> LedgerEntry:
        ledger_entry = LedgerEntry(**data.model_dump())

        self.db.add(ledger_entry)
        await self.db.flush()
        await self.db.refresh(ledger_entry)

        return ledger_entry

    async def sum_by_project_and_type(
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

        result = await self.db.execute(statement)
        return Decimal(str(result.scalar_one_or_none() or 0))
