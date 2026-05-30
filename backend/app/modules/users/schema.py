from datetime import datetime

from pydantic import EmailStr, Field

from app.shared.schemas import BaseSchema


class UserBase(BaseSchema):
    email: EmailStr
    full_name: str | None = Field(default=None, max_length=255)
    preferred_language: str = Field(default="ru", max_length=10)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseSchema):
    full_name: str | None = Field(default=None, max_length=255)
    preferred_language: str | None = Field(default=None, max_length=10)


class UserRoleRead(BaseSchema):
    id: int
    name: str
    title: str | None = None
    description: str | None = None
    is_active: bool | None = None


class UserRead(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_blocked: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime | None

    roles: list[UserRoleRead] = Field(default_factory=list)
    role_names: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)


class UserPrivateRead(UserRead):
    password_hash: str
