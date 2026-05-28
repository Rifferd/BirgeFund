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

    def list_latest(self, limit: int = 100) -> list[AuditLog]:
        statement = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
        return list(self.db.scalars(statement).all())
