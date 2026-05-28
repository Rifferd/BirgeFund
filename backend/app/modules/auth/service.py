from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.modules.auth.repository import RefreshTokenRepository
from app.modules.auth.schema import TokenResponse
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.refresh_tokens = RefreshTokenRepository(db)

    def get_password_hash(self, password: str) -> str:
        return hash_password(password)

    def verify_password(self, plain_password: str, password_hash: str) -> bool:
        return verify_password(plain_password, password_hash)

    def register(self, data: UserCreate) -> User:
        if self.users.exists_by_email(data.email):
            raise ConflictException("Пользователь с таким email уже существует")

        user = self.users.create(
            email=data.email,
            password_hash=self.get_password_hash(data.password),
            full_name=data.full_name,
            preferred_language=data.preferred_language,
        )

        self.db.commit()
        self.db.refresh(user)

        return user

    def authenticate(self, email: str, password: str) -> User:
        user = self.users.get_by_email(email)

        if user is None:
            raise UnauthorizedException()

        if not self.verify_password(password, user.password_hash):
            raise UnauthorizedException()

        if not user.is_active or user.is_blocked:
            raise UnauthorizedException("Пользователь заблокирован или неактивен")

        user = self.users.update_last_login(user)

        self.db.commit()
        self.db.refresh(user)

        return user

    def create_token_pair(self, user: User) -> TokenResponse:
        access_token = create_access_token(user.id)
        refresh_token, refresh_expires_at = create_refresh_token(user.id)

        self.refresh_tokens.create(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
        )

        self.db.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.authenticate(email=email, password=password)
        return self.create_token_pair(user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except ValueError:
            raise UnauthorizedException("Невалидный refresh token") from None

        if payload.get("type") != "refresh":
            raise UnauthorizedException("Невалидный тип токена")

        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Невалидный refresh token")

        stored_token = self.refresh_tokens.get_active_by_hash(hash_token(refresh_token))
        if stored_token is None:
            raise UnauthorizedException("Refresh token недействителен или истёк")

        user = self.users.get_by_id(int(user_id))
        if user is None or not user.is_active or user.is_blocked:
            raise UnauthorizedException("Пользователь заблокирован или неактивен")

        self.refresh_tokens.revoke(stored_token)

        return self.create_token_pair(user)
