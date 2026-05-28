from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.roles.model import Permission, Role
from app.modules.users.model import User


class RoleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_roles(self) -> list[Role]:
        statement = select(Role).order_by(Role.id.asc())
        return list(self.db.scalars(statement).all())

    def list_permissions(self) -> list[Permission]:
        statement = select(Permission).order_by(Permission.code.asc())
        return list(self.db.scalars(statement).all())

    def get_role_by_id(self, role_id: int) -> Role | None:
        statement = select(Role).where(Role.id == role_id)
        return self.db.scalar(statement)

    def get_role_by_name(self, name: str) -> Role | None:
        statement = select(Role).where(Role.name == name)
        return self.db.scalar(statement)

    def get_permission_by_code(self, code: str) -> Permission | None:
        statement = select(Permission).where(Permission.code == code)
        return self.db.scalar(statement)

    def create_permission(
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
        self.db.flush()
        self.db.refresh(permission)

        return permission

    def create_role(
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
        self.db.flush()
        self.db.refresh(role)

        return role

    def assign_role_to_user(self, user: User, role: Role) -> User:
        if role not in user.roles:
            user.roles.append(role)

        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)

        return user

    def assign_permission_to_role(self, role: Role, permission: Permission) -> Role:
        if permission not in role.permissions:
            role.permissions.append(permission)

        self.db.add(role)
        self.db.flush()
        self.db.refresh(role)

        return role

    def get_user_permissions(self, user: User) -> set[str]:
        permissions: set[str] = set()

        for role in user.roles:
            if not role.is_active:
                continue

            for permission in role.permissions:
                permissions.add(permission.code)

        return permissions
