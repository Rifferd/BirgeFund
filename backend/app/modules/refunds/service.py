from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException, TestModeOnlyException
from app.modules.audit.service import AuditActions, AuditLogService, EntityTypes
from app.modules.ledger.service import LedgerService
from app.modules.ledger.schema import LedgerEntryCreate
from app.modules.payments.repository import PaymentAttemptRepository
from app.modules.refunds.model import Refund
from app.modules.refunds.repository import RefundRepository
from app.modules.refunds.schema import RefundCreate
from app.modules.users.model import User
from app.shared.enums import LedgerEntryType, PaymentAttemptStatus


class RefundService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.payments = PaymentAttemptRepository(db)
        self.refunds = RefundRepository(db)
        self.ledger = LedgerService(db)
        self.audit = AuditLogService(db)

    def create_refund(
        self,
        *,
        payment_attempt_id: int,
        reason: str,
        current_user: User,
    ) -> Refund:
        if not settings.test_mode:
            raise TestModeOnlyException("Refund доступен только в TEST MODE")

        payment_attempt = self.payments.get_by_id(payment_attempt_id)

        if payment_attempt is None:
            raise NotFoundException("Платёжная попытка не найдена")

        if payment_attempt.status != PaymentAttemptStatus.SUCCESS:
            raise BadRequestException("Refund можно сделать только для успешной оплаты")

        already_refunded = self.refunds.sum_by_payment_attempt(payment_attempt.id)

        if already_refunded >= payment_attempt.amount:
            raise BadRequestException("Эта оплата уже полностью возвращена")

        refund_amount = payment_attempt.amount - already_refunded

        if refund_amount <= Decimal("0.00"):
            raise BadRequestException("Нет суммы для возврата")

        refund = self.refunds.create(
            RefundCreate(
                payment_attempt_id=payment_attempt.id,
                project_id=payment_attempt.project_id,
                user_id=payment_attempt.user_id,
                amount=refund_amount,
                currency=payment_attempt.currency,
                reason=reason,
                created_by_id=current_user.id,
            )
        )

        self.ledger.create_entry(
            LedgerEntryCreate(
                project_id=payment_attempt.project_id,
                user_id=payment_attempt.user_id,
                payment_attempt_id=payment_attempt.id,
                type=LedgerEntryType.REFUND,
                amount=-refund_amount,
                currency=payment_attempt.currency,
                created_by_id=current_user.id,
                meta={
                    "source": "test_refund",
                    "refund_id": refund.id,
                    "reason": reason,
                },
            )
        )

        self.audit.create_log(
            action=AuditActions.REFUND_CREATED,
            entity_type=EntityTypes.REFUND,
            entity_id=refund.id,
            actor=current_user,
            new_values={
                "payment_attempt_id": payment_attempt.id,
                "project_id": payment_attempt.project_id,
                "amount": str(refund_amount),
                "currency": payment_attempt.currency,
                "reason": reason,
            },
        )

        self.db.commit()
        self.db.refresh(refund)

        return refund

    def list_by_project(self, project_id: int) -> list[Refund]:
        return self.refunds.list_by_project(project_id)
