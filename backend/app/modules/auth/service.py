from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import hash_password, verify_password
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)

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
