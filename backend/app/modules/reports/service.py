from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException, PermissionDeniedException
from app.modules.projects.repository import ProjectRepository
from app.modules.reports.model import ProjectReport
from app.modules.reports.repository import ProjectReportRepository
from app.modules.reports.schema import ProjectReportCreate, ProjectReportUpdate
from app.modules.users.model import User
from app.shared.enums import ProjectStatus, ReportStatus


class ProjectReportService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.projects = ProjectRepository(db)
        self.reports = ProjectReportRepository(db)

    def list_all(self, status: ReportStatus | None = None) -> list[ProjectReport]:
        if status is None:
            return self.reports.list_all()

        return self.reports.list_by_status(status)

    def list_public_by_project(self, project_id: int) -> list[ProjectReport]:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        public_statuses = {
            ProjectStatus.FUNDRAISING,
            ProjectStatus.FUNDED,
            ProjectStatus.IN_PROGRESS,
            ProjectStatus.COMPLETED,
        }

        if project.status not in public_statuses:
            raise NotFoundException("Проект не найден")

        return self.reports.list_public_by_project(project_id)

    def list_my_project_reports(self, project_id: int, current_user: User) -> list[ProjectReport]:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно смотреть только отчёты своих проектов")

        return self.reports.list_by_project_for_author(project_id)

    def create(
        self,
        *,
        project_id: int,
        current_user: User,
        data: ProjectReportCreate,
    ) -> ProjectReport:
        project = self.projects.get_by_id(project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно создавать отчёты только для своих проектов")

        if project.status in {ProjectStatus.CANCELLED, ProjectStatus.FAILED}:
            raise BadRequestException("Нельзя создавать отчёты для отменённого или проваленного проекта")

        report = self.reports.create(
            project_id=project.id,
            author_id=current_user.id,
            data=data,
        )

        self.db.commit()
        self.db.refresh(report)

        return report

    def update(
        self,
        *,
        report_id: int,
        current_user: User,
        data: ProjectReportUpdate,
    ) -> ProjectReport:
        report = self._get_report(report_id)
        project = self.projects.get_by_id(report.project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно редактировать только свои отчёты")

        if report.status not in {ReportStatus.DRAFT, ReportStatus.REJECTED}:
            raise BadRequestException("Можно редактировать только черновик или отклонённый отчёт")

        report = self.reports.update(report, data)

        self.db.commit()
        self.db.refresh(report)

        return report

    def submit(self, report_id: int, current_user: User) -> ProjectReport:
        report = self._get_report(report_id)
        project = self.projects.get_by_id(report.project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.author_id != current_user.id:
            raise PermissionDeniedException("Можно отправлять только свои отчёты")

        if report.status not in {ReportStatus.DRAFT, ReportStatus.REJECTED}:
            raise BadRequestException("На проверку можно отправить только черновик или отклонённый отчёт")

        report = self.reports.submit(report)

        self.db.commit()
        self.db.refresh(report)

        return report

    def moderate(
        self,
        *,
        report_id: int,
        status: ReportStatus,
        moderator_comment: str | None,
    ) -> ProjectReport:
        report = self._get_report(report_id)

        if report.status != ReportStatus.PENDING_REVIEW:
            raise BadRequestException("Модерировать можно только отчёт на проверке")

        if status not in {ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.HIDDEN}:
            raise BadRequestException("Недопустимый статус модерации отчёта")

        if status in {ReportStatus.REJECTED, ReportStatus.HIDDEN} and not moderator_comment:
            raise BadRequestException("Для отклонения или скрытия отчёта нужен комментарий")

        report = self.reports.moderate(
            report=report,
            status=status,
            moderator_comment=moderator_comment,
        )

        self.db.commit()
        self.db.refresh(report)

        return report

    def _get_report(self, report_id: int) -> ProjectReport:
        report = self.reports.get_by_id(report_id)

        if report is None:
            raise NotFoundException("Отчёт не найден")

        return report
