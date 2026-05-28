from datetime import datetime
from typing import Any

from pydantic import Field

from app.shared.schemas import BaseSchema


class AuditLogCreate(BaseSchema):
    actor_id: int | None = None
    action: str = Field(max_length=150)
    entity_type: str = Field(max_length=100)
    entity_id: str | None = Field(default=None, max_length=100)
    old_values: dict[str, Any] | None = None
    new_values: dict[str, Any] | None = None
    meta: dict[str, Any] | None = None
    ip_address: str | None = Field(default=None, max_length=100)
    user_agent: str | None = None


class AuditLogRead(AuditLogCreate):
    id: int
    created_at: datetime
