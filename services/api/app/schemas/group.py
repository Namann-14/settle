from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.group_member import GroupMemberResponse


class GroupCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = None
    default_currency: str = Field(default="INR", min_length=3, max_length=3)
    created_by_id: UUID | None = None


class GroupUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    default_currency: str | None = Field(default=None, min_length=3, max_length=3)


class GroupResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    default_currency: str
    created_by_id: UUID
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    members: list[GroupMemberResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
