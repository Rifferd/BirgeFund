from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.projects.model import Project


class ProjectReward(Base):
    __tablename__ = "project_rewards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    limit_count: Mapped[int | None] = mapped_column(nullable=True)
    claimed_count: Mapped[int] = mapped_column(nullable=False, default=0)

    requires_delivery: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    estimated_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=func.now(),
    )

    project: Mapped["Project"] = relationship(
        back_populates="rewards",
        lazy="selectin",
    )

    @property
    def is_available(self) -> bool:
        if not self.is_active:
            return False

        if self.limit_count is None:
            return True

        return self.claimed_count < self.limit_count

    def __repr__(self) -> str:
        return f"ProjectReward(id={self.id!r}, project_id={self.project_id!r}, amount={self.amount!r})"
