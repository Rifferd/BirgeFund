from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.complaints.model import Complaint
from app.modules.complaints.schema import ComplaintCreate
from app.shared.enums import ComplaintStatus


class ComplaintRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, complaint_id: int) -> Complaint | None:
        statement = select(Complaint).where(Complaint.id == complaint_id)
        return self.db.scalar(statement)

    def list_all(self) -> list[Complaint]:
        statement = select(Complaint).order_by(Complaint.created_at.desc(), Complaint.id.desc())
        return list(self.db.scalars(statement).all())

    def list_by_status(self, status: ComplaintStatus) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.status == status)
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_my(self, reporter_id: int) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.reporter_id == reporter_id)
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def list_open(self) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.IN_REVIEW]))
            .order_by(Complaint.created_at.asc(), Complaint.id.asc())
        )
        return list(self.db.scalars(statement).all())

    def list_by_project(self, project_id: int) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.project_id == project_id)
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
        )
        return list(self.db.scalars(statement).all())

    def create(self, *, reporter_id: int, data: ComplaintCreate) -> Complaint:
        complaint = Complaint(
            reporter_id=reporter_id,
            project_id=data.project_id,
            comment_id=data.comment_id,
            reason=data.reason,
            text=data.text,
            status=ComplaintStatus.OPEN,
        )

        self.db.add(complaint)
        self.db.flush()
        self.db.refresh(complaint)

        return complaint

    def moderate(
        self,
        *,
        complaint: Complaint,
        status: ComplaintStatus,
        moderator_id: int,
        moderator_comment: str | None,
    ) -> Complaint:
        complaint.status = status
        complaint.moderator_id = moderator_id
        complaint.moderator_comment = moderator_comment

        if status in {ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED}:
            complaint.reviewed_at = datetime.now(UTC)

        self.db.add(complaint)
        self.db.flush()
        self.db.refresh(complaint)

        return complaint
