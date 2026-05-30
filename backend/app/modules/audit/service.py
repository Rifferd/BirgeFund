from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException

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
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.audit_logs = AuditLogRepository(db)

    async def create_log(
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

        audit_log = await self.audit_logs.create(
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
            await self.db.commit()
            await self.db.refresh(audit_log)

        return audit_log

    async def log_project_status_change(
        self,
        *,
        project_id: int,
        old_status: str,
        new_status: str,
        actor: User,
        reason: str | None = None,
    ) -> AuditLog:
        return await self.create_log(
            action=AuditActions.PROJECT_STATUS_CHANGED,
            entity_type=EntityTypes.PROJECT,
            entity_id=project_id,
            actor=actor,
            old_values={"status": old_status},
            new_values={"status": new_status},
            meta={"reason": reason} if reason else None,
        )

    async def get_by_id(self, audit_log_id: int) -> AuditLog:
        audit_log = await self.audit_logs.get_by_id(audit_log_id)

        if audit_log is None:
            raise NotFoundException("Audit log не найден")

        return audit_log

    async def list_latest(self, limit: int = 100) -> list[AuditLog]:
        return await self.audit_logs.list_latest(limit=limit)

    async def list_by_entity(self, *, entity_type: str, entity_id: str, limit: int = 100) -> list[AuditLog]:
        return await self.audit_logs.list_by_entity(
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit,
        )

    async def list_by_actor(self, *, actor_id: int, limit: int = 100) -> list[AuditLog]:
        return await self.audit_logs.list_by_actor(actor_id=actor_id, limit=limit)
