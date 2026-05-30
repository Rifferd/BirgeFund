from datetime import datetime

from pydantic import Field

from app.shared.schemas import BaseSchema


class PermissionBase(BaseSchema):
    code: str = Field(max_length=150)
    title: str = Field(max_length=150)
    description: str | None = Field(default=None, max_length=500)


class PermissionCreate(PermissionBase):
    pass


class PermissionRead(PermissionBase):
    id: int
    created_at: datetime


class RoleBase(BaseSchema):
    name: str = Field(max_length=100)
    title: str = Field(max_length=150)
    description: str | None = Field(default=None, max_length=500)


class RoleCreate(RoleBase):
    permission_codes: list[str] = Field(default_factory=list)


class RoleRead(RoleBase):
    id: int
    is_system: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime | None
    permissions: list[PermissionRead] = Field(default_factory=list)
