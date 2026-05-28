from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.payments.model import PaymentAttempt, PlatformFeeRule
from app.modules.payments.schema import MockPaymentCreateRequest, PlatformFeeRuleCreate, PlatformFeeRuleUpdate
from app.shared.enums import PaymentAttemptStatus, ProjectType


class PaymentAttemptRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, payment_attempt_id: int) -> PaymentAttempt | None:
        statement = select(PaymentAttempt).where(PaymentAttempt.id == payment_attempt_id)
        return self.db.scalar(statement)

    def get_by_user_and_idempotency_key(
        self,
        *,
        user_id: int,
        idempotency_key: str,
    ) -> PaymentAttempt | None:
        statement = select(PaymentAttempt).where(
            PaymentAttempt.user_id == user_id,
            PaymentAttempt.idempotency_key == idempotency_key,
        )
        return self.db.scalar(statement)

    def list_by_user(self, user_id: int) -> list[PaymentAttempt]:
        statement = (
            select(PaymentAttempt)
            .where(PaymentAttempt.user_id == user_id)
            .order_by(PaymentAttempt.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_by_project(self, project_id: int) -> list[PaymentAttempt]:
        statement = (
            select(PaymentAttempt)
            .where(PaymentAttempt.project_id == project_id)
            .order_by(PaymentAttempt.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def create(
        self,
        *,
        user_id: int,
        data: MockPaymentCreateRequest,
    ) -> PaymentAttempt:
        payment_attempt = PaymentAttempt(
            user_id=user_id,
            project_id=data.project_id,
            amount=data.amount,
            currency=data.currency,
            method=data.method,
            status=PaymentAttemptStatus.PENDING,
            idempotency_key=data.idempotency_key,
            request_payload=data.request_payload,
        )

        self.db.add(payment_attempt)
        self.db.flush()
        self.db.refresh(payment_attempt)

        return payment_attempt

    def mark_success(self, payment_attempt: PaymentAttempt) -> PaymentAttempt:
        payment_attempt.status = PaymentAttemptStatus.SUCCESS
        payment_attempt.confirmed_at = datetime.now(UTC)

        self.db.add(payment_attempt)
        self.db.flush()
        self.db.refresh(payment_attempt)

        return payment_attempt

    def mark_failed(self, payment_attempt: PaymentAttempt, reason: str) -> PaymentAttempt:
        payment_attempt.status = PaymentAttemptStatus.FAILED
        payment_attempt.failure_reason = reason
        payment_attempt.failed_at = datetime.now(UTC)

        self.db.add(payment_attempt)
        self.db.flush()
        self.db.refresh(payment_attempt)

        return payment_attempt

    def mark_cancelled(self, payment_attempt: PaymentAttempt) -> PaymentAttempt:
        payment_attempt.status = PaymentAttemptStatus.CANCELLED
        payment_attempt.cancelled_at = datetime.now(UTC)

        self.db.add(payment_attempt)
        self.db.flush()
        self.db.refresh(payment_attempt)

        return payment_attempt


class PlatformFeeRuleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_project_type(self, project_type: ProjectType) -> PlatformFeeRule | None:
        statement = select(PlatformFeeRule).where(PlatformFeeRule.project_type == project_type)
        return self.db.scalar(statement)

    def list_all(self) -> list[PlatformFeeRule]:
        statement = select(PlatformFeeRule).order_by(PlatformFeeRule.id.asc())
        return list(self.db.scalars(statement).all())

    def create(self, data: PlatformFeeRuleCreate) -> PlatformFeeRule:
        rule = PlatformFeeRule(**data.model_dump())

        self.db.add(rule)
        self.db.flush()
        self.db.refresh(rule)

        return rule

    def update(self, rule: PlatformFeeRule, data: PlatformFeeRuleUpdate) -> PlatformFeeRule:
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(rule, field, value)

        self.db.add(rule)
        self.db.flush()
        self.db.refresh(rule)

        return rule
