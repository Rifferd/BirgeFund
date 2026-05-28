from datetime import datetime
from decimal import Decimal
from typing import Any, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, JSON, Numeric, String, UniqueConstraint, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.shared.enums import MockPaymentMethod, PaymentAttemptStatus

if TYPE_CHECKING:
    from app.modules.projects.model import Project
    from app.modules.users.model import User


class PaymentAttempt(Base):
    __tablename__ = "payment_attempts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KGS")

    method: Mapped[MockPaymentMethod] = mapped_column(
        SAEnum(MockPaymentMethod, name="mock_payment_method", native_enum=False),
        nullable=False,
    )

    status: Mapped[PaymentAttemptStatus] = mapped_column(
        SAEnum(PaymentAttemptStatus, name="payment_attempt_status", native_enum=False),
        nullable=False,
        default=PaymentAttemptStatus.PENDING,
        index=True,
    )

    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    request_payload: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    failure_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(lazy="selectin")
    project: Mapped["Project"] = relationship(lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "idempotency_key", name="uq_payment_user_idempotency_key"),
    )

    def __repr__(self) -> str:
        return (
            f"PaymentAttempt(id={self.id!r}, user_id={self.user_id!r}, "
            f"project_id={self.project_id!r}, amount={self.amount!r}, status={self.status!r})"
        )
