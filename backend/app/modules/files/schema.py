from datetime import datetime

from app.shared.enums import FileType
from app.shared.schemas import BaseSchema


class FileCreate(BaseSchema):
    owner_id: int | None = None
    file_type: FileType
    original_name: str
    stored_name: str
    path: str
    url: str
    mime_type: str | None = None
    size_bytes: int
    is_public: bool = False


class FileRead(BaseSchema):
    id: int
    owner_id: int | None
    file_type: FileType
    original_name: str
    stored_name: str
    url: str
    mime_type: str | None
    size_bytes: int
    is_public: bool
    created_at: datetime
