from datetime import datetime
from decimal import Decimal
from typing import Any, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, JSON, Numeric, String, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.shared.enums import LedgerEntryStatus, LedgerEntryType

if TYPE_CHECKING:
    from app.modules.payments.model import PaymentAttempt
    from app.modules.projects.model import Project
    from app.modules.users.model import User


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    payment_attempt_id: Mapped[int | None] = mapped_column(
        ForeignKey("payment_attempts.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    type: Mapped[LedgerEntryType] = mapped_column(
        SAEnum(LedgerEntryType, name="ledger_entry_type", native_enum=False),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KGS")

    status: Mapped[LedgerEntryStatus] = mapped_column(
        SAEnum(LedgerEntryStatus, name="ledger_entry_status", native_enum=False),
        nullable=False,
        default=LedgerEntryStatus.POSTED,
        index=True,
    )

    meta: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    created_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    project: Mapped["Project"] = relationship(lazy="selectin")
    user: Mapped["User | None"] = relationship(
        foreign_keys=[user_id],
        lazy="selectin",
    )
    created_by: Mapped["User | None"] = relationship(
        foreign_keys=[created_by_id],
        lazy="selectin",
    )
    payment_attempt: Mapped["PaymentAttempt | None"] = relationship(lazy="selectin")

    def __repr__(self) -> str:
        return (
            f"LedgerEntry(id={self.id!r}, project_id={self.project_id!r}, "
            f"type={self.type!r}, amount={self.amount!r}, status={self.status!r})"
        )
