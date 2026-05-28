from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException, PermissionDeniedException
from app.modules.files.model import File
from app.modules.files.repository import FileRepository
from app.modules.files.schema import FileCreate
from app.modules.users.model import User
from app.shared.enums import FileType


IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

PDF_MIME_TYPES = {
    "application/pdf",
}

ALLOWED_MIME_TYPES = IMAGE_MIME_TYPES | PDF_MIME_TYPES

ALLOWED_EXTENSIONS_BY_MIME_TYPE = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "application/pdf": {".pdf"},
}

IMAGE_ONLY_FILE_TYPES = {
    FileType.PROJECT_IMAGE,
    FileType.CMS_IMAGE,
    FileType.BANNER_IMAGE,
}

IMAGE_OR_PDF_FILE_TYPES = {
    FileType.PROJECT_REPORT_FILE,
    FileType.AUTHOR_DOCUMENT,
}


class LocalFileStorageService:
    def __init__(self, upload_dir: str | None = None) -> None:
        self.upload_dir = Path(upload_dir or settings.upload_dir)

    def save(self, upload_file: UploadFile, file_type: FileType) -> tuple[str, str, int]:
        original_name = upload_file.filename or "uploaded-file"
        safe_name = self._safe_filename(original_name)
        stored_name = f"{uuid4().hex}_{safe_name}"

        target_dir = self.upload_dir / file_type.value
        target_dir.mkdir(parents=True, exist_ok=True)

        target_path = target_dir / stored_name

        size_bytes = 0
        upload_file.file.seek(0)

        with target_path.open("wb") as buffer:
            while chunk := upload_file.file.read(1024 * 1024):
                size_bytes += len(chunk)
                buffer.write(chunk)

        relative_path = target_path.as_posix()
        url = f"/uploads/{file_type.value}/{stored_name}"

        return relative_path, url, size_bytes

    def _safe_filename(self, filename: str) -> str:
        allowed_chars = []

        for char in filename.strip().replace(" ", "_"):
            if char.isalnum() or char in {".", "_", "-"}:
                allowed_chars.append(char)

        result = "".join(allowed_chars)

        if not result:
            return "file"

        return result[:120]


class FileValidationService:
    def validate(self, upload_file: UploadFile, file_type: FileType) -> int:
        original_name = upload_file.filename or ""
        suffix = Path(original_name).suffix.lower()
        mime_type = upload_file.content_type

        if not original_name:
            raise BadRequestException("Файл должен иметь имя")

        if mime_type not in ALLOWED_MIME_TYPES:
            raise BadRequestException("Недопустимый тип файла")

        allowed_extensions = ALLOWED_EXTENSIONS_BY_MIME_TYPE.get(mime_type, set())

        if suffix not in allowed_extensions:
            raise BadRequestException("Расширение файла не соответствует MIME type")

        if file_type in IMAGE_ONLY_FILE_TYPES and mime_type not in IMAGE_MIME_TYPES:
            raise BadRequestException("Для этого типа можно загружать только изображения")

        if file_type in IMAGE_OR_PDF_FILE_TYPES and mime_type not in ALLOWED_MIME_TYPES:
            raise BadRequestException("Для этого типа можно загружать только изображения или PDF")

        size_bytes = self._get_size(upload_file)

        if mime_type in IMAGE_MIME_TYPES:
            max_size = settings.max_image_size_mb * 1024 * 1024

            if size_bytes > max_size:
                raise BadRequestException(
                    f"Размер изображения не должен превышать {settings.max_image_size_mb} MB"
                )

        if mime_type in PDF_MIME_TYPES:
            max_size = settings.max_pdf_size_mb * 1024 * 1024

            if size_bytes > max_size:
                raise BadRequestException(
                    f"Размер PDF не должен превышать {settings.max_pdf_size_mb} MB"
                )

        upload_file.file.seek(0)

        return size_bytes

    def _get_size(self, upload_file: UploadFile) -> int:
        upload_file.file.seek(0, 2)
        size_bytes = upload_file.file.tell()
        upload_file.file.seek(0)

        if size_bytes <= 0:
            raise BadRequestException("Файл пустой")

        return size_bytes


class FileService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.files = FileRepository(db)
        self.storage = LocalFileStorageService()
        self.validator = FileValidationService()

    def upload(
        self,
        *,
        upload_file: UploadFile,
        current_user: User,
        file_type: FileType,
        is_public: bool = False,
    ) -> File:
        size_bytes = self.validator.validate(upload_file, file_type)
        path, url, saved_size_bytes = self.storage.save(upload_file, file_type)

        file = self.files.create(
            FileCreate(
                owner_id=current_user.id,
                file_type=file_type,
                original_name=upload_file.filename or "uploaded-file",
                stored_name=Path(path).name,
                path=path,
                url=url,
                mime_type=upload_file.content_type,
                size_bytes=saved_size_bytes or size_bytes,
                is_public=is_public,
            )
        )

        self.db.commit()
        self.db.refresh(file)

        return file

    def get_metadata(self, file_id: int, current_user: User | None = None) -> File:
        file = self.files.get_by_id(file_id)

        if file is None:
            raise NotFoundException("Файл не найден")

        if file.is_public:
            return file

        if current_user is None or file.owner_id != current_user.id:
            raise PermissionDeniedException("Нет доступа к файлу")

        return file
