from collections.abc import Callable

from fastapi import Depends

from app.api.deps import get_current_user
from app.core.exceptions import PermissionDeniedException
from app.modules.users.model import User


class Permissions:
    USERS_READ = "users.read"
    USERS_UPDATE = "users.update"
    USERS_BLOCK = "users.block"

    PROJECTS_CREATE = "projects.create"
    PROJECTS_UPDATE = "projects.update"
    PROJECTS_MODERATE = "projects.moderate"
    PROJECTS_FREEZE = "projects.freeze"

    PAYMENTS_READ = "payments.read"
    PAYMENTS_REFUND = "payments.refund"

    REPORTS_MODERATE = "reports.moderate"
    COMPLAINTS_MANAGE = "complaints.manage"

    SETTINGS_UPDATE = "settings.update"
    TRANSLATIONS_UPDATE = "translations.update"
    AUDIT_READ = "audit.read"
    CMS_UPDATE = "cms.update"


def get_user_permission_codes(user: User) -> set[str]:
    permission_codes: set[str] = set()

    for role in user.roles:
        if not role.is_active:
            continue

        for permission in role.permissions:
            permission_codes.add(permission.code)

    return permission_codes


def require_permission(permission_code: str) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_permissions = get_user_permission_codes(current_user)

        if permission_code not in user_permissions:
            raise PermissionDeniedException("У пользователя нет нужного права доступа")

        return current_user

    return dependency


def require_any_permission(permission_codes: list[str]) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_permissions = get_user_permission_codes(current_user)

        if not set(permission_codes).intersection(user_permissions):
            raise PermissionDeniedException("У пользователя нет нужных прав доступа")

        return current_user

    return dependency


def require_all_permissions(permission_codes: list[str]) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_permissions = get_user_permission_codes(current_user)

        if not set(permission_codes).issubset(user_permissions):
            raise PermissionDeniedException("У пользователя нет всех нужных прав доступа")

        return current_user

    return dependency
