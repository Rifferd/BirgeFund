from typing import Any

from sqlalchemy.orm import Session

from app.modules.audit.model import AuditLog
from app.modules.audit.repository import AuditLogRepository
from app.modules.audit.schema import AuditLogCreate
from app.modules.users.model import User


class AuditActions:
    PROJECT_CREATED = "project.created"
    PROJECT_UPDATED = "project.updated"
    PROJECT_SUBMITTED = "project.submitted"
    PROJECT_STATUS_CHANGED = "project.status_changed"

    AUTH_REGISTERED = "auth.registered"
    AUTH_LOGIN = "auth.login"

    PAYMENT_CREATED = "payment.created"
    PAYMENT_CONFIRMED = "payment.confirmed"
    REFUND_CREATED = "refund.created"

    USER_ROLE_CHANGED = "user.role_changed"
    USER_BLOCKED = "user.blocked"
    SETTINGS_UPDATED = "settings.updated"
    TRANSLATION_UPDATED = "translation.updated"
    CMS_UPDATED = "cms.updated"


class EntityTypes:
    PROJECT = "project"
    USER = "user"
    PAYMENT_ATTEMPT = "payment_attempt"
    REFUND = "refund"
    SETTINGS = "settings"
    TRANSLATION = "translation"
    CMS_PAGE = "cms_page"


class AuditLogService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.audit_logs = AuditLogRepository(db)

    def create_log(
        self,
        *,
        action: str,
        entity_type: str,
        entity_id: int | str | None = None,
        actor: User | None = None,
        actor_id: int | None = None,
        old_values: dict[str, Any] | None = None,
        new_values: dict[str, Any] | None = None,
        meta: dict[str, Any] | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        commit: bool = False,
    ) -> AuditLog:
        resolved_actor_id = actor.id if actor is not None else actor_id

        audit_log = self.audit_logs.create(
            AuditLogCreate(
                actor_id=resolved_actor_id,
                action=action,
                entity_type=entity_type,
                entity_id=str(entity_id) if entity_id is not None else None,
                old_values=old_values,
                new_values=new_values,
                meta=meta,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        )

        if commit:
            self.db.commit()
            self.db.refresh(audit_log)

        return audit_log

    def log_project_status_change(
        self,
        *,
        project_id: int,
        old_status: str,
        new_status: str,
        actor: User,
        reason: str | None = None,
    ) -> AuditLog:
        return self.create_log(
            action=AuditActions.PROJECT_STATUS_CHANGED,
            entity_type=EntityTypes.PROJECT,
            entity_id=project_id,
            actor=actor,
            old_values={"status": old_status},
            new_values={"status": new_status},
            meta={"reason": reason} if reason else None,
        )

    def list_latest(self, limit: int = 100) -> list[AuditLog]:
        return self.audit_logs.list_latest(limit=limit)
