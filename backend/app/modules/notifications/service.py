from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, PermissionDeniedException
from app.modules.notifications.model import Notification
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.schema import NotificationCreate
from app.modules.users.model import User
from app.shared.enums import NotificationType


class NotificationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.notifications = NotificationRepository(db)

    async def create(
        self,
        *,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        entity_type: str | None = None,
        entity_id: int | str | None = None,
        payload: dict | None = None,
        commit: bool = False,
    ) -> Notification:
        notification = await self.notifications.create(
            NotificationCreate(
                user_id=user_id,
                type=type,
                title=title,
                message=message,
                entity_type=entity_type,
                entity_id=str(entity_id) if entity_id is not None else None,
                payload=payload,
            )
        )

        if commit:
            await self.db.commit()
            await self.db.refresh(notification)

        return notification

    async def list_my(self, current_user: User) -> list[Notification]:
        return await self.notifications.list_by_user(current_user.id)

    async def count_my_unread(self, current_user: User) -> int:
        return await self.notifications.count_unread_by_user(current_user.id)

    async def mark_as_read(self, notification_id: int, current_user: User) -> Notification:
        notification = await self.notifications.get_by_id(notification_id)

        if notification is None:
            raise NotFoundException("Уведомление не найдено")

        if notification.user_id != current_user.id:
            raise PermissionDeniedException("Нет доступа к уведомлению")

        notification = await self.notifications.mark_as_read(notification)

        await self.db.commit()
        await self.db.refresh(notification)

        return notification

    async def mark_all_as_read(self, current_user: User) -> list[Notification]:
        notifications = await self.notifications.mark_all_as_read(current_user.id)

        await self.db.commit()

        return notifications
