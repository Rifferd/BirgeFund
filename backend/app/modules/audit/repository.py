from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.audit.model import AuditLog
from app.modules.audit.schema import AuditLogCreate


class AuditLogRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: AuditLogCreate) -> AuditLog:
        audit_log = AuditLog(**data.model_dump())

        self.db.add(audit_log)
        self.db.flush()
        self.db.refresh(audit_log)

        return audit_log

    def get_by_id(self, audit_log_id: int) -> AuditLog | None:
        statement = select(AuditLog).where(AuditLog.id == audit_log_id)
        return self.db.scalar(statement)

    def list_latest(self, limit: int = 100) -> list[AuditLog]:
        statement = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
        return list(self.db.scalars(statement).all())

    def list_by_entity(self, *, entity_type: str, entity_id: str, limit: int = 100) -> list[AuditLog]:
        statement = (
            select(AuditLog)
            .where(
                AuditLog.entity_type == entity_type,
                AuditLog.entity_id == entity_id,
            )
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(statement).all())

    def list_by_actor(self, *, actor_id: int, limit: int = 100) -> list[AuditLog]:
        statement = (
            select(AuditLog)
            .where(AuditLog.actor_id == actor_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(statement).all())
