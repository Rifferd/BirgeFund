from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.roles.model import Permission, Role
from app.modules.users.model import User


class RoleRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_roles(self) -> list[Role]:
        statement = (
            select(Role)
            .options(selectinload(Role.permissions))
            .order_by(Role.id.asc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().unique().all())

    async def list_permissions(self) -> list[Permission]:
        statement = select(Permission).order_by(Permission.code.asc())
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def get_role_by_id(self, role_id: int) -> Role | None:
        statement = (
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.id == role_id)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_role_by_name(self, name: str) -> Role | None:
        statement = (
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.name == name)
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def get_permission_by_code(self, code: str) -> Permission | None:
        statement = select(Permission).where(Permission.code == code)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def create_permission(
        self,
        *,
        code: str,
        title: str,
        description: str | None = None,
    ) -> Permission:
        permission = Permission(
            code=code,
            title=title,
            description=description,
        )

        self.db.add(permission)
        await self.db.flush()
        await self.db.refresh(permission)

        return permission

    async def create_role(
        self,
        *,
        name: str,
        title: str,
        description: str | None = None,
        is_system: bool = False,
    ) -> Role:
        role = Role(
            name=name,
            title=title,
            description=description,
            is_system=is_system,
        )

        self.db.add(role)
        await self.db.flush()
        await self.db.refresh(role)

        return role

    async def assign_role_to_user(self, user: User, role: Role) -> User:
        if role not in user.roles:
            user.roles.append(role)

        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        return user

    async def assign_permission_to_role(self, role: Role, permission: Permission) -> Role:
        if permission not in role.permissions:
            role.permissions.append(permission)

        self.db.add(role)
        await self.db.flush()
        await self.db.refresh(role)

        return role

    def get_user_permissions(self, user: User) -> set[str]:
        permissions: set[str] = set()

        for role in user.roles:
            if not role.is_active:
                continue

            for permission in role.permissions:
                permissions.add(permission.code)

        return permissions
