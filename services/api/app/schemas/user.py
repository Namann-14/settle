from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    clerk_user_id: str = Field(..., max_length=255)
    email: str | None = Field(default=None, max_length=255)
    name: str | None = Field(default=None, max_length=255)
    default_currency: str = Field(default="INR", min_length=3, max_length=3)


class UserUpdate(BaseModel):
    email: str | None = Field(default=None, max_length=255)
    name: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    default_currency: str | None = Field(default=None, min_length=3, max_length=3)


class UserResponse(BaseModel):
    id: UUID
    clerk_user_id: str
    email: str | None = None
    name: str | None = None
    is_active: bool
    default_currency: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)