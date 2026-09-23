from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.controllers import group as group_controller
from app.db.enums import GroupRole
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.balances import GroupBalancesResponse
from app.schemas.group import GroupCreate, GroupResponse, GroupUpdate
from app.schemas.invitation import (
    InvitationResponse,
    InviteMemberRequest,
    InviteMemberResponse,
)
from app.schemas.group_member import GroupMemberResponse


class AddMemberRequest(BaseModel):
    user_id: UUID
    role: GroupRole = GroupRole.MEMBER


router = APIRouter(
    prefix="/groups",
    tags=["groups"],
)


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    schema: GroupCreate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Create a new group. Authenticated user becomes the creator and ADMIN.
    """
    with handle_controller_errors():
        return group_controller.create_group(db, current_user, schema)


@router.get("", response_model=list[GroupResponse])
def list_groups(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List all groups the authenticated user is an active member of.
    """
    with handle_controller_errors():
        return group_controller.list_user_groups(db, current_user)


@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
    group_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve details for a specific group.
    """
    with handle_controller_errors():
        return group_controller.get_group(db, group_id, current_user)


@router.patch("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: UUID,
    schema: GroupUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update group details. Only group ADMINs are authorized.
    """
    with handle_controller_errors():
        return group_controller.update_group(db, group_id, current_user, schema)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Delete a group. Only group ADMINs are authorized.
    """
    with handle_controller_errors():
        group_controller.delete_group(db, group_id, current_user)
        return None


@router.post("/{group_id}/members", response_model=GroupMemberResponse, status_code=status.HTTP_201_CREATED)
def add_group_member(
    group_id: UUID,
    payload: AddMemberRequest,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Add a user to a group. Only group ADMINs are authorized.
    """
    with handle_controller_errors():
        return group_controller.add_member(
            db,
            group_id=group_id,
            current_user=current_user,
            user_id_to_add=payload.user_id,
            role=payload.role,
        )


@router.delete("/{group_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_group_member(
    group_id: UUID,
    member_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Remove a member (admins) or leave the group (yourself). Refused while the
    member still has an unsettled balance.
    """
    with handle_controller_errors():
        group_controller.remove_member(db, group_id, member_id, current_user)
        return None


@router.post("/{group_id}/invitations", response_model=InviteMemberResponse, status_code=status.HTTP_201_CREATED)
def invite_group_member(
    group_id: UUID,
    payload: InviteMemberRequest,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Add someone by email. Existing users join immediately; anyone else gets a
    pending invite that's claimed when they first sign in with that email.
    """
    with handle_controller_errors():
        member, invitation = group_controller.invite_by_email(
            db, group_id, current_user, str(payload.email), payload.role
        )
        if member is not None:
            return InviteMemberResponse(status="added", member=member)
        return InviteMemberResponse(status="invited", invitation=invitation)


@router.get("/{group_id}/invitations", response_model=list[InvitationResponse])
def list_group_invitations(
    group_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Pending, unexpired invitations for a group.
    """
    with handle_controller_errors():
        return group_controller.list_invitations(db, group_id, current_user)


@router.delete("/{group_id}/invitations/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_group_invitation(
    group_id: UUID,
    invitation_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Cancel a pending invitation.
    """
    with handle_controller_errors():
        group_controller.cancel_invitation(db, group_id, invitation_id, current_user)
        return None


@router.get("/{group_id}/balances", response_model=GroupBalancesResponse)
def get_group_balances(
    group_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Each member's net position plus the fewest transfers that settle the group.
    """
    with handle_controller_errors():
        return group_controller.get_group_balances(db, group_id, current_user)
