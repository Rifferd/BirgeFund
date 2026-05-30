from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.files.model import File
from app.modules.files.schema import FileCreate


class FileRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, file_id: int) -> File | None:
        statement = select(File).where(File.id == file_id)
        return self.db.scalar(statement)

    def create(self, data: FileCreate) -> File:
        file = File(**data.model_dump())

        self.db.add(file)
        self.db.flush()
        self.db.refresh(file)

        return file
