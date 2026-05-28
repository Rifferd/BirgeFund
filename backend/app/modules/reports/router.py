from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database_session
from app.core.permissions import Permissions, require_permission
from app.modules.reports.schema import (
    ProjectReportCreate,
    ProjectReportModerationRequest,
    ProjectReportRead,
    ProjectReportUpdate,
)
from app.modules.reports.service import ProjectReportService
from app.modules.users.model import User

router = APIRouter(tags=["reports"])


@router.get("/projects/{project_id}/reports", response_model=list[ProjectReportRead])
def list_project_reports(
    project_id: int,
    db: Session = Depends(get_database_session),
) -> list[ProjectReportRead]:
    service = ProjectReportService(db)
    return service.list_public_by_project(project_id)


@router.get("/projects/{project_id}/reports/my", response_model=list[ProjectReportRead])
def list_my_project_reports(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> list[ProjectReportRead]:
    service = ProjectReportService(db)
    return service.list_my_project_reports(project_id, current_user)


@router.post(
    "/projects/{project_id}/reports",
    response_model=ProjectReportRead,
    status_code=status.HTTP_201_CREATED,
)
def create_project_report(
    project_id: int,
    payload: ProjectReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> ProjectReportRead:
    service = ProjectReportService(db)
    return service.create(
        project_id=project_id,
        current_user=current_user,
        data=payload,
    )


@router.patch("/reports/{report_id}", response_model=ProjectReportRead)
def update_project_report(
    report_id: int,
    payload: ProjectReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> ProjectReportRead:
    service = ProjectReportService(db)
    return service.update(
        report_id=report_id,
        current_user=current_user,
        data=payload,
    )


@router.post("/reports/{report_id}/submit-review", response_model=ProjectReportRead)
def submit_project_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> ProjectReportRead:
    service = ProjectReportService(db)
    return service.submit(report_id, current_user)


@router.patch("/reports/{report_id}/status", response_model=ProjectReportRead)
def moderate_project_report(
    report_id: int,
    payload: ProjectReportModerationRequest,
    current_user: User = Depends(require_permission(Permissions.REPORTS_MODERATE)),
    db: Session = Depends(get_database_session),
) -> ProjectReportRead:
    service = ProjectReportService(db)
    return service.moderate(
        report_id=report_id,
        status=payload.status,
        moderator_comment=payload.moderator_comment,
    )
