from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers import group as group_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.group import GroupResponse
from app.schemas.invitation import InvitationResponse

router = APIRouter(
    prefix="/invitations",
    tags=["invitations"],
)


@router.get("", response_model=list[InvitationResponse])
def list_my_invitations(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Pending group invites addressed to the current user (their inbox).
    """
    with handle_controller_errors():
        return group_controller.list_my_invitations(db, current_user)


@router.post("/{invitation_id}/accept", response_model=GroupResponse)
def accept_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Accept an invite and join the group.
    """
    with handle_controller_errors():
        return group_controller.respond_to_invitation(db, invitation_id, current_user, accept=True)


@router.post("/{invitation_id}/decline", status_code=status.HTTP_204_NO_CONTENT)
def decline_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Decline an invite.
    """
    with handle_controller_errors():
        group_controller.respond_to_invitation(db, invitation_id, current_user, accept=False)
        return None
