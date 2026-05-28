from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.shared.enums import FundingType, ProjectStatus, ProjectType

if TYPE_CHECKING:
    from app.modules.users.model import User
    from app.modules.categories.model import Category
    from app.modules.rewards.model import ProjectReward


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus, name="project_status", native_enum=False),
        nullable=False,
        default=ProjectStatus.DRAFT,
        index=True,
    )

    project_type: Mapped[ProjectType] = mapped_column(
        SAEnum(ProjectType, name="project_type", native_enum=False),
        nullable=False,
        index=True,
    )

    funding_type: Mapped[FundingType] = mapped_column(
        SAEnum(FundingType, name="funding_type", native_enum=False),
        nullable=False,
        default=FundingType.ALL_OR_NOTHING,
        index=True,
    )

    city: Mapped[str | None] = mapped_column(String(120), nullable=True)

    goal_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KGS")

    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)

    cover_image_id: Mapped[int | None] = mapped_column(nullable=True)

    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    frozen_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

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
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    author: Mapped["User"] = relationship(lazy="selectin")

    translations: Mapped[list["ProjectTranslation"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    categories: Mapped[list["Category"]] = relationship(
        secondary="project_categories",
        back_populates="projects",
        lazy="selectin",
    )

    rewards: Mapped[list["ProjectReward"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    updates: Mapped[list["ProjectUpdateItem"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"Project(id={self.id!r}, slug={self.slug!r}, status={self.status!r})"


class ProjectTranslation(Base):
    __tablename__ = "project_translations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    language: Mapped[str] = mapped_column(String(10), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    risks: Mapped[str | None] = mapped_column(Text, nullable=True)
    refund_policy: Mapped[str | None] = mapped_column(Text, nullable=True)

    reward_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_text: Mapped[str | None] = mapped_column(Text, nullable=True)

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

    project: Mapped[Project] = relationship(
        back_populates="translations",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("project_id", "language", name="uq_project_translation_language"),
    )

    def __repr__(self) -> str:
        return f"ProjectTranslation(project_id={self.project_id!r}, language={self.language!r})"


class ProjectUpdateItem(Base):
    __tablename__ = "project_updates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    language: Mapped[str] = mapped_column(String(10), nullable=False, default="ru", index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    is_public: Mapped[bool] = mapped_column(nullable=False, default=True)

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

    project: Mapped[Project] = relationship(
        back_populates="updates",
        lazy="selectin",
    )

    author: Mapped["User"] = relationship(lazy="selectin")

    def __repr__(self) -> str:
        return f"ProjectUpdateItem(id={self.id!r}, project_id={self.project_id!r})"
