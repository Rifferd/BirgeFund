from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.notifications.model import Notification
from app.modules.notifications.schema import NotificationCreate


class NotificationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, notification_id: int) -> Notification | None:
        statement = select(Notification).where(Notification.id == notification_id)
        return self.db.scalar(statement)

    def list_by_user(self, user_id: int) -> list[Notification]:
        statement = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def count_unread_by_user(self, user_id: int) -> int:
        statement = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.read_at.is_(None),
        )
        return int(self.db.scalar(statement) or 0)

    def create(self, data: NotificationCreate) -> Notification:
        notification = Notification(**data.model_dump())

        self.db.add(notification)
        self.db.flush()
        self.db.refresh(notification)

        return notification

    def mark_as_read(self, notification: Notification) -> Notification:
        if notification.read_at is None:
            notification.read_at = datetime.now(UTC)

        self.db.add(notification)
        self.db.flush()
        self.db.refresh(notification)

        return notification

    def mark_all_as_read(self, user_id: int) -> list[Notification]:
        notifications = self.list_by_user(user_id)

        now = datetime.now(UTC)

        for notification in notifications:
            if notification.read_at is None:
                notification.read_at = now
                self.db.add(notification)

        self.db.flush()

        return notifications
