from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.enums import GroupRole, InvitationStatus
from app.schemas.group_member import GroupMemberResponse


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: GroupRole = GroupRole.MEMBER


class InvitationResponse(BaseModel):
    id: UUID
    group_id: UUID
    email: str
    status: InvitationStatus
    expires_at: datetime
    invited_by_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InviteMemberResponse(BaseModel):
    """Existing users are added straight away; unknown emails get a pending invite."""

    status: Literal["added", "invited"]
    member: GroupMemberResponse | None = None
    invitation: InvitationResponse | None = None


class InvitationList(BaseModel):
    invitations: list[InvitationResponse] = Field(default_factory=list)
