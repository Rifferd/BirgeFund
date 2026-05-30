from fastapi import APIRouter, Depends

from app.core.permissions import Permissions, require_permission
from app.modules.users.model import User

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/admin-only")
def admin_only(
    current_user: User = Depends(require_permission(Permissions.USERS_READ)),
) -> dict[str, str | int]:
    return {
        "message": "Permission check passed",
        "user_id": current_user.id,
        "required_permission": Permissions.USERS_READ,
    }
