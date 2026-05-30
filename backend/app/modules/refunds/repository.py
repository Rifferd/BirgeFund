from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.refunds.model import Refund
from app.modules.refunds.schema import RefundCreate


class RefundRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, refund_id: int) -> Refund | None:
        statement = select(Refund).where(Refund.id == refund_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Refund]:
        statement = select(Refund).order_by(Refund.created_at.desc(), Refund.id.desc())
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_by_payment_attempt(self, payment_attempt_id: int) -> list[Refund]:
        statement = (
            select(Refund)
            .where(Refund.payment_attempt_id == payment_attempt_id)
            .order_by(Refund.created_at.desc(), Refund.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_by_project(self, project_id: int) -> list[Refund]:
        statement = (
            select(Refund)
            .where(Refund.project_id == project_id)
            .order_by(Refund.created_at.desc(), Refund.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def sum_by_payment_attempt(self, payment_attempt_id: int) -> Decimal:
        statement = select(func.coalesce(func.sum(Refund.amount), 0)).where(
            Refund.payment_attempt_id == payment_attempt_id
        )
        result = await self.db.execute(statement)
        return Decimal(str(result.scalar_one_or_none() or 0))

    async def create(self, data: RefundCreate) -> Refund:
        refund = Refund(**data.model_dump())

        self.db.add(refund)
        await self.db.flush()
        await self.db.refresh(refund)

        return refund
