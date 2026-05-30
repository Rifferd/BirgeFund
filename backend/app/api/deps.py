from collections.abc import Generator

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token
from app.db.session import get_db
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_database_session() -> Generator[Session, None, None]:
    yield from get_db()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_database_session),
) -> User:
    try:
        payload = decode_token(token)
    except ValueError:
        raise UnauthorizedException("Невалидный access token") from None

    if payload.get("type") != "access":
        raise UnauthorizedException("Невалидный тип токена")

    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedException("Невалидный access token")

    user = UserRepository(db).get_by_id(int(user_id))

    if user is None:
        raise UnauthorizedException("Пользователь не найден")

    if not user.is_active or user.is_blocked:
        raise UnauthorizedException("Пользователь заблокирован или неактивен")

    return user
