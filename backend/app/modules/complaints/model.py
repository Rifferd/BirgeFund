from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.shared.enums import ComplaintReason, ComplaintStatus

if TYPE_CHECKING:
    from app.modules.comments.model import Comment
    from app.modules.projects.model import Project
    from app.modules.users.model import User


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    reporter_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    comment_id: Mapped[int | None] = mapped_column(
        ForeignKey("comments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    reason: Mapped[ComplaintReason] = mapped_column(
        SAEnum(ComplaintReason, name="complaint_reason", native_enum=False),
        nullable=False,
        index=True,
    )

    text: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[ComplaintStatus] = mapped_column(
        SAEnum(ComplaintStatus, name="complaint_status", native_enum=False),
        nullable=False,
        default=ComplaintStatus.OPEN,
        index=True,
    )

    moderator_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    moderator_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    reporter: Mapped["User"] = relationship(
        foreign_keys=[reporter_id],
        lazy="selectin",
    )
    moderator: Mapped["User | None"] = relationship(
        foreign_keys=[moderator_id],
        lazy="selectin",
    )
    project: Mapped["Project"] = relationship(lazy="selectin")
    comment: Mapped["Comment | None"] = relationship(lazy="selectin")

    def __repr__(self) -> str:
        return f"Complaint(id={self.id!r}, project_id={self.project_id!r}, status={self.status!r})"
