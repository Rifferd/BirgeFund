from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.model import Notification
from app.modules.notifications.schema import NotificationCreate


class NotificationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, notification_id: int) -> Notification | None:
        statement = select(Notification).where(Notification.id == notification_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> list[Notification]:
        statement = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def count_unread_by_user(self, user_id: int) -> int:
        statement = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.read_at.is_(None),
        )
        result = await self.db.execute(statement)
        return int(result.scalar_one_or_none() or 0)

    async def create(self, data: NotificationCreate) -> Notification:
        notification = Notification(**data.model_dump())

        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)

        return notification

    async def mark_as_read(self, notification: Notification) -> Notification:
        if notification.read_at is None:
            notification.read_at = datetime.now(UTC)

        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)

        return notification

    async def mark_all_as_read(self, user_id: int) -> list[Notification]:
        notifications = await self.list_by_user(user_id)

        now = datetime.now(UTC)

        for notification in notifications:
            if notification.read_at is None:
                notification.read_at = now
                self.db.add(notification)

        await self.db.flush()

        return notifications
