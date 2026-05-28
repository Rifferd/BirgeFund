from datetime import datetime
from typing import Any

from pydantic import Field

from app.shared.enums import NotificationType
from app.shared.schemas import BaseSchema


class NotificationCreate(BaseSchema):
    user_id: int
    type: NotificationType
    title: str = Field(min_length=2, max_length=255)
    message: str = Field(min_length=2)
    entity_type: str | None = Field(default=None, max_length=100)
    entity_id: str | None = Field(default=None, max_length=100)
    payload: dict[str, Any] | None = None


class NotificationRead(BaseSchema):
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: str
    entity_type: str | None
    entity_id: str | None
    payload: dict[str, Any] | None
    read_at: datetime | None
    created_at: datetime


class UnreadNotificationsCount(BaseSchema):
    count: int
