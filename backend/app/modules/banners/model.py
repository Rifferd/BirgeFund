from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.shared.enums import BannerPlacement

if TYPE_CHECKING:
    from app.modules.files.model import File


class Banner(Base):
    __tablename__ = "banners"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)

    placement: Mapped[BannerPlacement] = mapped_column(
        SAEnum(BannerPlacement, name="banner_placement", native_enum=False),
        nullable=False,
        index=True,
    )

    image_file_id: Mapped[int | None] = mapped_column(
        ForeignKey("files.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

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

    image_file: Mapped["File | None"] = relationship(lazy="selectin")

    translations: Mapped[list["BannerTranslation"]] = relationship(
        back_populates="banner",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"Banner(id={self.id!r}, slug={self.slug!r}, placement={self.placement!r})"


class BannerTranslation(Base):
    __tablename__ = "banner_translations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    banner_id: Mapped[int] = mapped_column(
        ForeignKey("banners.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    language: Mapped[str] = mapped_column(String(10), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(Text, nullable=True)
    cta_text: Mapped[str | None] = mapped_column(String(100), nullable=True)

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

    banner: Mapped[Banner] = relationship(
        back_populates="translations",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("banner_id", "language", name="uq_banner_translation_language"),
    )

    def __repr__(self) -> str:
        return f"BannerTranslation(banner_id={self.banner_id!r}, language={self.language!r})"
