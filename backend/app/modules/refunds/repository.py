from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.refunds.model import Refund
from app.modules.refunds.schema import RefundCreate


class RefundRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, refund_id: int) -> Refund | None:
        statement = select(Refund).where(Refund.id == refund_id)
        return self.db.scalar(statement)

    def list_by_payment_attempt(self, payment_attempt_id: int) -> list[Refund]:
        statement = (
            select(Refund)
            .where(Refund.payment_attempt_id == payment_attempt_id)
            .order_by(Refund.created_at.desc(), Refund.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_by_project(self, project_id: int) -> list[Refund]:
        statement = (
            select(Refund)
            .where(Refund.project_id == project_id)
            .order_by(Refund.created_at.desc(), Refund.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def sum_by_payment_attempt(self, payment_attempt_id: int) -> Decimal:
        statement = select(func.coalesce(func.sum(Refund.amount), 0)).where(
            Refund.payment_attempt_id == payment_attempt_id
        )
        return Decimal(str(self.db.scalar(statement) or 0))

    def create(self, data: RefundCreate) -> Refund:
        refund = Refund(**data.model_dump())

        self.db.add(refund)
        self.db.flush()
        self.db.refresh(refund)

        return refund
