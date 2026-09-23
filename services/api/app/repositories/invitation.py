import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.enums import InvitationStatus
from app.models.invitation import GroupInvitation

INVITE_TTL = timedelta(days=30)


def get_pending_invitation(db: Session, group_id: UUID, email: str) -> GroupInvitation | None:
    stmt = select(GroupInvitation).where(
        GroupInvitation.group_id == group_id,
        func.lower(GroupInvitation.email) == email.lower(),
        GroupInvitation.status == InvitationStatus.PENDING,
    )
    return db.execute(stmt).scalar_one_or_none()


def get_invitation_by_id(db: Session, invitation_id: UUID) -> GroupInvitation | None:
    return db.get(GroupInvitation, invitation_id)


def list_group_invitations(db: Session, group_id: UUID) -> list[GroupInvitation]:
    stmt = (
        select(GroupInvitation)
        .where(
            GroupInvitation.group_id == group_id,
            GroupInvitation.status == InvitationStatus.PENDING,
            GroupInvitation.expires_at > datetime.now(timezone.utc),
        )
        .order_by(GroupInvitation.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def list_pending_for_email(db: Session, email: str) -> list[GroupInvitation]:
    stmt = select(GroupInvitation).where(
        func.lower(GroupInvitation.email) == email.lower(),
        GroupInvitation.status == InvitationStatus.PENDING,
        GroupInvitation.expires_at > datetime.now(timezone.utc),
    )
    return list(db.execute(stmt).scalars().all())


def create_invitation(db: Session, group_id: UUID, email: str, invited_by_id: UUID) -> GroupInvitation:
    invitation = GroupInvitation(
        group_id=group_id,
        email=email.lower(),
        token=secrets.token_urlsafe(32),
        expires_at=datetime.now(timezone.utc) + INVITE_TTL,
        invited_by_id=invited_by_id,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


def set_status(
    db: Session,
    invitation: GroupInvitation,
    status: InvitationStatus,
    invited_user_id: UUID | None = None,
    commit: bool = True,
) -> GroupInvitation:
    invitation.status = status
    if invited_user_id is not None:
        invitation.invited_user_id = invited_user_id
    db.add(invitation)
    if commit:
        db.commit()
        db.refresh(invitation)
    return invitation
