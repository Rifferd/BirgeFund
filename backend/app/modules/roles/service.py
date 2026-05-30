from sqlalchemy.orm import Session

from app.modules.roles.model import Permission, Role
from app.modules.roles.repository import RoleRepository
from app.modules.users.model import User


class RoleService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.roles = RoleRepository(db)

    def get_or_create_permission(
        self,
        *,
        code: str,
        title: str,
        description: str | None = None,
    ) -> Permission:
        permission = self.roles.get_permission_by_code(code)

        if permission is not None:
            return permission

        return self.roles.create_permission(
            code=code,
            title=title,
            description=description,
        )

    def get_or_create_role(
        self,
        *,
        name: str,
        title: str,
        description: str | None = None,
        is_system: bool = False,
    ) -> Role:
        role = self.roles.get_role_by_name(name)

        if role is not None:
            return role

        return self.roles.create_role(
            name=name,
            title=title,
            description=description,
            is_system=is_system,
        )

    def assign_role_to_user(self, user: User, role_name: str) -> User:
        role = self.roles.get_role_by_name(role_name)

        if role is None:
            raise ValueError(f"Role {role_name} does not exist")

        user = self.roles.assign_role_to_user(user, role)
        self.db.commit()
        self.db.refresh(user)

        return user

    def get_user_permissions(self, user: User) -> set[str]:
        return self.roles.get_user_permissions(user)

    def user_has_permission(self, user: User, permission_code: str) -> bool:
        permissions = self.get_user_permissions(user)
        return permission_code in permissions

    def user_has_any_permission(self, user: User, permission_codes: list[str]) -> bool:
        permissions = self.get_user_permissions(user)
        return bool(set(permission_codes).intersection(permissions))

    def user_has_all_permissions(self, user: User, permission_codes: list[str]) -> bool:
        permissions = self.get_user_permissions(user)
        return set(permission_codes).issubset(permissions)
