from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.reports.model import ProjectReport
from app.modules.reports.schema import ProjectReportCreate, ProjectReportUpdate
from app.shared.enums import ReportStatus


class ProjectReportRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, report_id: int) -> ProjectReport | None:
        statement = select(ProjectReport).where(ProjectReport.id == report_id)
        return self.db.scalar(statement)

    def list_public_by_project(self, project_id: int) -> list[ProjectReport]:
        statement = (
            select(ProjectReport)
            .where(
                ProjectReport.project_id == project_id,
                ProjectReport.status == ReportStatus.APPROVED,
            )
            .order_by(ProjectReport.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_by_project_for_author(self, project_id: int) -> list[ProjectReport]:
        statement = (
            select(ProjectReport)
            .where(ProjectReport.project_id == project_id)
            .order_by(ProjectReport.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def create(
        self,
        *,
        project_id: int,
        author_id: int,
        data: ProjectReportCreate,
    ) -> ProjectReport:
        report = ProjectReport(
            project_id=project_id,
            author_id=author_id,
            language=data.language,
            title=data.title,
            text=data.text,
            expense_amount=data.expense_amount,
            status=ReportStatus.DRAFT,
        )

        self.db.add(report)
        self.db.flush()
        self.db.refresh(report)

        return report

    def update(self, report: ProjectReport, data: ProjectReportUpdate) -> ProjectReport:
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(report, field, value)

        self.db.add(report)
        self.db.flush()
        self.db.refresh(report)

        return report

    def submit(self, report: ProjectReport) -> ProjectReport:
        report.status = ReportStatus.PENDING_REVIEW
        report.submitted_at = datetime.now(UTC)

        self.db.add(report)
        self.db.flush()
        self.db.refresh(report)

        return report

    def moderate(
        self,
        *,
        report: ProjectReport,
        status: ReportStatus,
        moderator_comment: str | None,
    ) -> ProjectReport:
        report.status = status
        report.moderator_comment = moderator_comment
        report.reviewed_at = datetime.now(UTC)

        self.db.add(report)
        self.db.flush()
        self.db.refresh(report)

        return report
