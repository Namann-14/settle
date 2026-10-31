from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.enums import InvitationStatus


class InviteMemberRequest(BaseModel):
    # No role: invitees always join as MEMBER, so a member can't mint admins.
    email: EmailStr


class InvitationResponse(BaseModel):
    id: UUID
    group_id: UUID
    email: str
    status: InvitationStatus
    expires_at: datetime
    invited_by_id: UUID
    created_at: datetime
    group_name: str | None = None
    invited_by_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InviteMemberResponse(BaseModel):
    """Every invite waits for the invitee to accept or decline."""

    status: Literal["invited"] = "invited"
    invitation: InvitationResponse


class InvitationList(BaseModel):
    invitations: list[InvitationResponse] = Field(default_factory=list)


class JoinLinkResponse(BaseModel):
    code: str


class JoinPreviewResponse(BaseModel):
    """What someone sees before joining a group through its link."""

    group_id: UUID
    name: str
    description: str | None = None
    member_count: int
    already_member: bool
