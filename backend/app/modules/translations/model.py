from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StaticTranslation(Base):
    __tablename__ = "static_translations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    namespace: Mapped[str] = mapped_column(String(100), nullable=False, default="common", index=True)
    key: Mapped[str] = mapped_column(String(200), nullable=False, index=True)

    ru: Mapped[str] = mapped_column(Text, nullable=False)
    kg: Mapped[str | None] = mapped_column(Text, nullable=True)
    en: Mapped[str | None] = mapped_column(Text, nullable=True)

    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
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

    __table_args__ = (
        UniqueConstraint("namespace", "key", name="uq_static_translation_namespace_key"),
    )

    def __repr__(self) -> str:
        return f"StaticTranslation(namespace={self.namespace!r}, key={self.key!r})"
