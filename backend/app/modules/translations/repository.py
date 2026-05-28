from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.translations.model import StaticTranslation
from app.modules.translations.schema import StaticTranslationCreate, StaticTranslationUpdate


class StaticTranslationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, translation_id: int) -> StaticTranslation | None:
        statement = select(StaticTranslation).where(StaticTranslation.id == translation_id)
        return self.db.scalar(statement)

    def get_by_namespace_and_key(self, namespace: str, key: str) -> StaticTranslation | None:
        statement = select(StaticTranslation).where(
            StaticTranslation.namespace == namespace,
            StaticTranslation.key == key,
        )
        return self.db.scalar(statement)

    def list_all(self) -> list[StaticTranslation]:
        statement = select(StaticTranslation).order_by(
            StaticTranslation.namespace.asc(),
            StaticTranslation.key.asc(),
        )
        return list(self.db.scalars(statement).all())

    def list_active(self, namespace: str | None = None) -> list[StaticTranslation]:
        statement = select(StaticTranslation).where(StaticTranslation.is_active.is_(True))

        if namespace is not None:
            statement = statement.where(StaticTranslation.namespace == namespace)

        statement = statement.order_by(
            StaticTranslation.namespace.asc(),
            StaticTranslation.key.asc(),
        )

        return list(self.db.scalars(statement).all())

    def create(self, data: StaticTranslationCreate) -> StaticTranslation:
        translation = StaticTranslation(**data.model_dump())

        self.db.add(translation)
        self.db.flush()
        self.db.refresh(translation)

        return translation

    def update(
        self,
        translation: StaticTranslation,
        data: StaticTranslationUpdate,
    ) -> StaticTranslation:
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(translation, field, value)

        self.db.add(translation)
        self.db.flush()
        self.db.refresh(translation)

        return translation
