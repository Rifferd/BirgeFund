from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.roles.model import Role
from app.modules.users.model import User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _with_roles(self):
        return selectinload(User.roles).selectinload(Role.permissions)

    async def get_by_id(self, user_id: int) -> User | None:
        statement = (
            select(User)
            .options(self._with_roles())
            .where(User.id == user_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        statement = (
            select(User)
            .options(self._with_roles())
            .where(User.email == email.lower())
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def create(
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
        await self.db.flush()
        await self.db.refresh(user)

        return user

    async def exists_by_email(self, email: str) -> bool:
        return await self.get_by_email(email) is not None

    async def update_last_login(self, user: User) -> User:
        user.last_login_at = datetime.now(UTC)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        return user
