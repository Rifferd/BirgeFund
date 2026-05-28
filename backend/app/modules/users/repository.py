from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.users.model import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        statement = select(User).where(User.id == user_id)
        return self.db.scalar(statement)

    def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email.lower())
        return self.db.scalar(statement)

    def create(
        self,
        *,
        email: str,
        password_hash: str,
        full_name: str | None = None,
        preferred_language: str = "ru",
    ) -> User:
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            full_name=full_name,
            preferred_language=preferred_language,
        )

        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)

        return user

    def exists_by_email(self, email: str) -> bool:
        return self.get_by_email(email) is not None
