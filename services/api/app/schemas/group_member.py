from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.db.enums import GroupRole


class GroupMemberCreate(BaseModel):
    group_id: UUID
    user_id: UUID
    role: GroupRole = GroupRole.MEMBER


class GroupMemberUpdate(BaseModel):
    role: GroupRole | None = None
    removed_at: datetime | None = None


class GroupMemberResponse(BaseModel):
    id: UUID
    group_id: UUID
    user_id: UUID
    role: GroupRole
    removed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
