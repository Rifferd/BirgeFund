from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str


class ErrorDetail(BaseModel):
    message: str
    code: str


class ErrorResponse(BaseModel):
    detail: ErrorDetail


class IdResponse(BaseModel):
    id: int | UUID


class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime | None = None


class TestModeResponse(BaseModel):
    test_mode: bool = True
    message: str = "Операция выполнена в тестовом режиме"
