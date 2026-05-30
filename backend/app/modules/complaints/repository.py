from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.complaints.model import Complaint
from app.modules.complaints.schema import ComplaintCreate
from app.shared.enums import ComplaintStatus


class ComplaintRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, complaint_id: int) -> Complaint | None:
        statement = select(Complaint).where(Complaint.id == complaint_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Complaint]:
        statement = select(Complaint).order_by(Complaint.created_at.desc(), Complaint.id.desc())
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_by_status(self, status: ComplaintStatus) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.status == status)
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_my(self, reporter_id: int) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.reporter_id == reporter_id)
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_open(self) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.IN_REVIEW]))
            .order_by(Complaint.created_at.asc(), Complaint.id.asc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_by_project(self, project_id: int) -> list[Complaint]:
        statement = (
            select(Complaint)
            .where(Complaint.project_id == project_id)
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
        )
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create(self, *, reporter_id: int, data: ComplaintCreate) -> Complaint:
        complaint = Complaint(
            reporter_id=reporter_id,
            project_id=data.project_id,
            comment_id=data.comment_id,
            reason=data.reason,
            text=data.text,
            status=ComplaintStatus.OPEN,
        )

        self.db.add(complaint)
        await self.db.flush()
        await self.db.refresh(complaint)

        return complaint

    async def moderate(
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
        await self.db.flush()
        await self.db.refresh(complaint)

        return complaint
