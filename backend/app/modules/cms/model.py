from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CMSPage(Base):
    __tablename__ = "cms_pages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)

    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

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

    translations: Mapped[list["CMSPageTranslation"]] = relationship(
        back_populates="page",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def publish(self) -> None:
        self.is_published = True
        self.published_at = datetime.now(UTC)

    def unpublish(self) -> None:
        self.is_published = False
        self.published_at = None

    def __repr__(self) -> str:
        return f"CMSPage(id={self.id!r}, slug={self.slug!r}, is_published={self.is_published!r})"


class CMSPageTranslation(Base):
    __tablename__ = "cms_page_translations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    page_id: Mapped[int] = mapped_column(
        ForeignKey("cms_pages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    language: Mapped[str] = mapped_column(String(10), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

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

    page: Mapped[CMSPage] = relationship(
        back_populates="translations",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("page_id", "language", name="uq_cms_page_translation_language"),
    )

    def __repr__(self) -> str:
        return f"CMSPageTranslation(page_id={self.page_id!r}, language={self.language!r})"
