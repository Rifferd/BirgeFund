from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.files.model import File
from app.modules.files.schema import FileCreate


class FileRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, file_id: int) -> File | None:
        statement = select(File).where(File.id == file_id)
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, data: FileCreate) -> File:
        file = File(**data.model_dump())

        self.db.add(file)
        await self.db.flush()
        await self.db.refresh(file)

        return file
