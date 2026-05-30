from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database_session
from app.modules.notifications.schema import NotificationRead, UnreadNotificationsCount
from app.modules.notifications.service import NotificationService
from app.modules.users.model import User
from app.shared.schemas import MessageResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/my", response_model=list[NotificationRead])
def list_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> list[NotificationRead]:
    service = NotificationService(db)
    return service.list_my(current_user)


@router.get("/unread-count", response_model=UnreadNotificationsCount)
def count_unread_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> UnreadNotificationsCount:
    service = NotificationService(db)
    return UnreadNotificationsCount(count=service.count_my_unread(current_user))


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> NotificationRead:
    service = NotificationService(db)
    return service.mark_as_read(notification_id, current_user)


@router.patch("/read-all", response_model=MessageResponse)
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> MessageResponse:
    service = NotificationService(db)
    service.mark_all_as_read(current_user)
    return MessageResponse(message="Все уведомления отмечены как прочитанные")
