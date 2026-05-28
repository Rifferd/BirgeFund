from fastapi import APIRouter, Depends, File as FastAPIFile, Query, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database_session
from app.modules.files.schema import FileRead
from app.modules.files.service import FileService
from app.modules.users.model import User
from app.shared.enums import FileType

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileRead)
def upload_file(
    file: UploadFile = FastAPIFile(...),
    file_type: FileType = Query(default=FileType.PROJECT_IMAGE),
    is_public: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> FileRead:
    service = FileService(db)
    return service.upload(
        upload_file=file,
        current_user=current_user,
        file_type=file_type,
        is_public=is_public,
    )


@router.get("/{file_id}", response_model=FileRead)
def get_file_metadata(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database_session),
) -> FileRead:
    service = FileService(db)
    return service.get_metadata(file_id=file_id, current_user=current_user)
