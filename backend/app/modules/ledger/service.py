from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ledger.model import LedgerEntry
from app.modules.ledger.repository import LedgerEntryRepository
from app.modules.ledger.schema import LedgerEntryCreate, ProjectLedgerSummary
from app.modules.payments.model import PaymentAttempt
from app.shared.enums import LedgerEntryType


class LedgerService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.ledger = LedgerEntryRepository(db)

    async def create_entry(self, data: LedgerEntryCreate, *, commit: bool = False) -> LedgerEntry:
        entry = await self.ledger.create(data)

        if commit:
            await self.db.commit()
            await self.db.refresh(entry)

        return entry

    async def list_by_project(self, project_id: int) -> list[LedgerEntry]:
        return await self.ledger.list_by_project(project_id)

    async def list_by_user(self, user_id: int) -> list[LedgerEntry]:
        return await self.ledger.list_by_user(user_id)

    async def list_by_payment_attempt(self, payment_attempt_id: int) -> list[LedgerEntry]:
        return await self.ledger.list_by_payment_attempt(payment_attempt_id)

    async def has_entries_for_payment_attempt(self, payment_attempt_id: int) -> bool:
        return bool(await self.list_by_payment_attempt(payment_attempt_id))

    async def create_payment_entries(
        self,
        *,
        payment_attempt: PaymentAttempt,
        platform_fee_amount: Decimal,
        created_by_id: int,
    ) -> list[LedgerEntry]:
        project_net_amount = payment_attempt.amount - platform_fee_amount

        entries = [
            await self.create_entry(
                LedgerEntryCreate(
                    project_id=payment_attempt.project_id,
                    user_id=payment_attempt.user_id,
                    payment_attempt_id=payment_attempt.id,
                    type=LedgerEntryType.PROJECT_GROSS,
                    amount=payment_attempt.amount,
                    currency=payment_attempt.currency,
                    created_by_id=created_by_id,
                    meta={"source": "mock_payment"},
                )
            ),
            await self.create_entry(
                LedgerEntryCreate(
                    project_id=payment_attempt.project_id,
                    user_id=payment_attempt.user_id,
                    payment_attempt_id=payment_attempt.id,
                    type=LedgerEntryType.PLATFORM_FEE,
                    amount=-platform_fee_amount,
                    currency=payment_attempt.currency,
                    created_by_id=created_by_id,
                    meta={"source": "mock_payment"},
                )
            ),
            await self.create_entry(
                LedgerEntryCreate(
                    project_id=payment_attempt.project_id,
                    user_id=payment_attempt.user_id,
                    payment_attempt_id=payment_attempt.id,
                    type=LedgerEntryType.PROJECT_NET,
                    amount=project_net_amount,
                    currency=payment_attempt.currency,
                    created_by_id=created_by_id,
                    meta={"source": "mock_payment"},
                )
            ),
        ]

        return entries

    async def get_project_summary(self, project_id: int) -> ProjectLedgerSummary:
        project_gross = await self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.PROJECT_GROSS,
        )
        project_net = await self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.PROJECT_NET,
        )
        platform_fee = await self.ledger.sum_by_project_and_type(
            project_id=project_id,
            entry_type=LedgerEntryType.PLATFORM_FEE,
        )
        refund = await self.ledger.sum_by_project_and_type(
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
