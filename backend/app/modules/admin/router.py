from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.admin.schema import AdminDashboardStats
from app.modules.admin.service import AdminDashboardService
from app.modules.users.model import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard(
    current_user: User = Depends(require_permission(Permissions.ADMIN_DASHBOARD)),
    db: Session = Depends(get_database_session),
) -> AdminDashboardStats:
    service = AdminDashboardService(db)
    return service.get_stats()
