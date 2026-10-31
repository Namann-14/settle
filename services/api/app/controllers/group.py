from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from html import escape
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers.exceptions import (
    ConflictError,
    GroupNotFoundError,
    PermissionDeniedError,
    UserNotFoundError,
    ValidationError,
)
from app.db.enums import GroupRole, InvitationStatus
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.user import User

from app.models.invitation import GroupInvitation
from app.repositories import expense as expense_repo
from app.repositories import group as group_repo
from app.repositories import invitation as invitation_repo
from app.repositories import settlement as settlement_repo
from app.repositories import user as user_repo
from app.schemas.balances import GroupBalancesResponse, MemberBalance, Transfer
from app.schemas.group import GroupCreate, GroupUpdate
from app.schemas.group_member import GroupMemberCreate
from app.services import telegram as tg
from app.services.balances import compute_group_nets, simplify_debts


def _get_active_membership(members: list[GroupMember], user_id: UUID) -> GroupMember | None:
    """
    Helper to return active group membership for a given user.
    """
    for member in members:
        if member.user_id == user_id and member.removed_at is None:
            return member
    return None


def create_group(
    db: Session,
    current_user: User,
    schema: GroupCreate,
) -> Group:
    """
    Creates a new group. Automatically sets current_user as creator and ADMIN.
    """
    schema.created_by_id = current_user.id
    return group_repo.create_group(db, schema)


def get_group(
    db: Session,
    group_id: UUID,
    current_user: User,
) -> Group:
    """
    Retrieves group details for an active group member.
    """
    group = group_repo.get_group_by_id(db, group_id)
    if not group:
        raise GroupNotFoundError("Group not found")

    active_member = _get_active_membership(group.members, current_user.id)
    if not active_member:
        raise PermissionDeniedError("You are not a member of this group")

    return group


def list_user_groups(
    db: Session,
    current_user: User,
) -> list[Group]:
    """
    Lists all groups the authenticated user is currently an active member of.
    """
    return group_repo.get_user_groups(db, current_user.id)


def update_group(
    db: Session,
    group_id: UUID,
    current_user: User,
    schema: GroupUpdate,
) -> Group:
    """
    Updates group details. Only group ADMINs are authorized.
    """
    group = group_repo.get_group_by_id(db, group_id)
    if not group:
        raise GroupNotFoundError("Group not found")

    active_member = _get_active_membership(group.members, current_user.id)
    if not active_member or active_member.role != GroupRole.ADMIN:
        raise PermissionDeniedError("Only group admins can update group details")

    return group_repo.update_group(db, group, schema)


def delete_group(
    db: Session,
    group_id: UUID,
    current_user: User,
) -> bool:
    """
    Deletes a group. Only group ADMINs are authorized.
    """
    group = group_repo.get_group_by_id(db, group_id)
    if not group:
        raise GroupNotFoundError("Group not found")

    active_member = _get_active_membership(group.members, current_user.id)
    if not active_member or active_member.role != GroupRole.ADMIN:
        raise PermissionDeniedError("Only group admins can delete the group")

    return group_repo.delete_group(db, group)


def add_member(
    db: Session,
    group_id: UUID,
    current_user: User,
    user_id_to_add: UUID,
    role: GroupRole = GroupRole.MEMBER,
) -> GroupMember:
    """
    Adds a user to a group. Only group ADMINs may add members.
    Prevents adding duplicate members.
    """
    group = group_repo.get_group_by_id(db, group_id)
    if not group:
        raise GroupNotFoundError("Group not found")

    active_member = _get_active_membership(group.members, current_user.id)
    if not active_member or active_member.role != GroupRole.ADMIN:
        raise PermissionDeniedError("Only group admins can add members to the group")

    target_user = user_repo.get_user_by_id(db, user_id_to_add)
    if not target_user:
        raise UserNotFoundError("User to add was not found")

    existing_membership = _get_active_membership(group.members, user_id_to_add)
    if existing_membership:
        raise ConflictError("User is already an active member of this group")

    member_schema = GroupMemberCreate(
        group_id=group_id,
        user_id=user_id_to_add,
        role=role,
    )
    return group_repo.add_group_member(db, member_schema)


def invite_member(
    db: Session,
    group_id: UUID,
    current_user: User,
    user_id_to_invite: UUID,
    role: GroupRole = GroupRole.MEMBER,
) -> GroupMember:
    """
    Invites/adds a member to the group. Only group ADMINs may invite members.
    """
    return add_member(
        db=db,
        group_id=group_id,
        current_user=current_user,
        user_id_to_add=user_id_to_invite,
        role=role,
    )


def _require_member(db: Session, group_id: UUID, current_user: User) -> tuple[Group, GroupMember]:
    group = group_repo.get_group_by_id(db, group_id)
    if not group:
        raise GroupNotFoundError("Group not found")
    membership = _get_active_membership(group.members, current_user.id)
    if not membership:
        raise PermissionDeniedError("You are not a member of this group")
    return group, membership


INVITE_ACCEPT_PREFIX = "inv:y:"
INVITE_DECLINE_PREFIX = "inv:n:"


def _display_name(user: User) -> str:
    return user.name or user.email or "Someone"


def _notify_invitee(invitation: GroupInvitation, group: Group, inviter: User, invitee: User | None) -> None:
    """Best-effort Telegram ping with Join/Decline buttons; the in-app inbox is the source of truth."""
    if invitee is None or invitee.telegram_chat_id is None or not tg.is_configured():
        return
    tg.send_buttons(
        invitee.telegram_chat_id,
        f"👋 <b>{escape(_display_name(inviter))}</b> invited you to join "
        f"<b>{escape(group.name)}</b> on Settle.",
        [
            (f"{INVITE_ACCEPT_PREFIX}{invitation.id}", "✅ Join"),
            (f"{INVITE_DECLINE_PREFIX}{invitation.id}", "✖️ Decline"),
        ],
    )


def _notify_inviter(invitation: GroupInvitation, invitee: User, accepted: bool) -> None:
    inviter = invitation.invited_by
    if inviter is None or inviter.telegram_chat_id is None or not tg.is_configured():
        return
    verb = "joined" if accepted else "declined your invite to"
    group_name = invitation.group_name or "your group"
    tg.send_text(
        inviter.telegram_chat_id,
        f"{escape(_display_name(invitee))} {verb} <b>{escape(group_name)}</b>.",
    )


def invite_by_email(
    db: Session,
    group_id: UUID,
    current_user: User,
    email: str,
) -> GroupInvitation:
    """
    Invites someone by email. Any active member may invite. Nobody is added
    without consent: the invitee sees the invite in their inbox (and on
    Telegram, if linked) and accepts or declines it. Invitees always join as
    MEMBER.
    """
    group, _ = _require_member(db, group_id, current_user)

    target = user_repo.get_user_by_email(db, email)
    if target and _get_active_membership(group.members, target.id):
        raise ConflictError("That person is already in this group")

    existing = invitation_repo.get_pending_invitation(db, group_id, email)
    if existing:
        if existing.expires_at > datetime.now(timezone.utc):
            raise ConflictError("An invite for this email is already pending")
        # An expired invite still holds the one-pending-per-email index.
        invitation_repo.set_status(db, existing, InvitationStatus.EXPIRED)

    invitation = invitation_repo.create_invitation(
        db, group_id, email, current_user.id, invited_user_id=target.id if target else None
    )
    _notify_invitee(invitation, group, current_user, target)
    return invitation


def list_invitations(db: Session, group_id: UUID, current_user: User) -> list[GroupInvitation]:
    _require_member(db, group_id, current_user)
    return invitation_repo.list_group_invitations(db, group_id)


def cancel_invitation(db: Session, group_id: UUID, invitation_id: UUID, current_user: User) -> None:
    """The inviter or a group admin can withdraw a pending invite."""
    _, membership = _require_member(db, group_id, current_user)
    invitation = invitation_repo.get_invitation_by_id(db, invitation_id)
    if not invitation or invitation.group_id != group_id or invitation.status != InvitationStatus.PENDING:
        raise GroupNotFoundError("Invitation not found")
    if invitation.invited_by_id != current_user.id and membership.role != GroupRole.ADMIN:
        raise PermissionDeniedError("Only the person who sent the invite or an admin can cancel it")
    invitation_repo.set_status(db, invitation, InvitationStatus.CANCELLED)


def list_my_invitations(db: Session, current_user: User) -> list[GroupInvitation]:
    return invitation_repo.list_pending_for_user(db, current_user.id, current_user.email)


def _is_addressed_to(invitation: GroupInvitation, user: User) -> bool:
    if invitation.invited_user_id == user.id:
        return True
    return bool(user.email) and invitation.email.lower() == user.email.lower()


def respond_to_invitation(db: Session, invitation_id: UUID, current_user: User, accept: bool) -> Group:
    """
    Accepts (joins the group as MEMBER) or declines an invite addressed to the
    current user. Returns the group either way.
    """
    invitation = invitation_repo.get_invitation_by_id(db, invitation_id)
    if not invitation or not _is_addressed_to(invitation, current_user):
        raise GroupNotFoundError("Invitation not found")
    if invitation.status != InvitationStatus.PENDING:
        raise ConflictError("This invite was already answered or withdrawn")
    if invitation.expires_at <= datetime.now(timezone.utc):
        invitation_repo.set_status(db, invitation, InvitationStatus.EXPIRED)
        raise ValidationError("This invite has expired. Ask for a new one")

    group = group_repo.get_group_by_id(db, invitation.group_id)
    if not group:
        invitation_repo.set_status(db, invitation, InvitationStatus.CANCELLED)
        raise GroupNotFoundError("That group no longer exists")

    if accept:
        if not _get_active_membership(group.members, current_user.id):
            group_repo.add_group_member(
                db, GroupMemberCreate(group_id=group.id, user_id=current_user.id, role=GroupRole.MEMBER)
            )
        invitation_repo.set_status(db, invitation, InvitationStatus.ACCEPTED, invited_user_id=current_user.id)
    else:
        invitation_repo.set_status(db, invitation, InvitationStatus.DECLINED, invited_user_id=current_user.id)

    _notify_inviter(invitation, current_user, accept)
    return group_repo.get_group_by_id(db, group.id)


def get_join_code(db: Session, group_id: UUID, current_user: User) -> str:
    """Any member can share the join link; it's created on first request."""
    group, _ = _require_member(db, group_id, current_user)
    if not group.join_code:
        group = group_repo.set_join_code(db, group)
    return group.join_code


def reset_join_code(db: Session, group_id: UUID, current_user: User) -> str:
    """Admins can replace the link, which stops the old one from working."""
    group, membership = _require_member(db, group_id, current_user)
    if membership.role != GroupRole.ADMIN:
        raise PermissionDeniedError("Only group admins can reset the join link")
    return group_repo.set_join_code(db, group).join_code


def _group_for_code(db: Session, code: str) -> Group:
    group = group_repo.get_group_by_join_code(db, code)
    if not group:
        raise GroupNotFoundError("This join link is invalid or has been reset")
    return group


def preview_join(db: Session, code: str, current_user: User) -> tuple[Group, int, bool]:
    group = _group_for_code(db, code)
    active = [m for m in group.members if m.removed_at is None]
    already = any(m.user_id == current_user.id for m in active)
    return group, len(active), already


def join_by_code(db: Session, code: str, current_user: User) -> Group:
    """Opening the link and pressing Join is the consent, so it adds the user right away."""
    group = _group_for_code(db, code)
    if not _get_active_membership(group.members, current_user.id):
        group_repo.add_group_member(
            db, GroupMemberCreate(group_id=group.id, user_id=current_user.id, role=GroupRole.MEMBER)
        )
    # Joining answers any pending invite to this group.
    for invitation in invitation_repo.list_pending_for_user(db, current_user.id, current_user.email):
        if invitation.group_id == group.id:
            invitation_repo.set_status(
                db, invitation, InvitationStatus.ACCEPTED, invited_user_id=current_user.id
            )
    return group_repo.get_group_by_id(db, group.id)


def get_group_balances(db: Session, group_id: UUID, current_user: User) -> GroupBalancesResponse:
    group, _ = _require_member(db, group_id, current_user)

    expenses = expense_repo.get_all_group_expenses(db, group_id)
    settlements = settlement_repo.get_all_group_settlements(db, group_id)
    nets = compute_group_nets(expenses, settlements)

    members_by_user = {m.user_id: m for m in group.members}
    # Active members always appear; removed ones only while they still carry a balance.
    user_ids = [m.user_id for m in group.members if m.removed_at is None]
    user_ids += [uid for uid, net in nets.items() if uid not in user_ids and net != 0]

    members = []
    for uid in user_ids:
        member = members_by_user.get(uid)
        members.append(
            MemberBalance(
                user_id=uid,
                user_name=member.user_name if member else None,
                user_email=member.user_email if member else None,
                net=nets.get(uid, 0),
            )
        )
    members.sort(key=lambda m: m.net, reverse=True)

    transfers = [
        Transfer(from_user_id=f, to_user_id=t, amount=a) for f, t, a in simplify_debts(nets)
    ]
    return GroupBalancesResponse(
        group_id=group.id,
        currency=group.default_currency,
        members=members,
        transfers=transfers,
    )


def remove_member(db: Session, group_id: UUID, member_id: UUID, current_user: User) -> None:
    """
    Removes a member (soft). Admins can remove anyone; members can only leave
    themselves. Blocked while the member still has an unsettled balance.
    """
    group, me = _require_member(db, group_id, current_user)

    target = next((m for m in group.members if m.id == member_id and m.removed_at is None), None)
    if not target:
        raise GroupNotFoundError("Member not found")

    if target.user_id != current_user.id and me.role != GroupRole.ADMIN:
        raise PermissionDeniedError("Only group admins can remove other members")

    active = [m for m in group.members if m.removed_at is None]
    if target.role == GroupRole.ADMIN and len(active) > 1:
        admins = [m for m in active if m.role == GroupRole.ADMIN]
        if len(admins) == 1:
            raise ValidationError("Make someone else an admin before the last admin leaves")

    expenses = expense_repo.get_all_group_expenses(db, group_id)
    settlements = settlement_repo.get_all_group_settlements(db, group_id)
    if abs(compute_group_nets(expenses, settlements).get(target.user_id, 0)) >= Decimal("0.01"):
        raise ValidationError("Settle this member's balance before removing them")

    group_repo.remove_group_member(db, group_id, target.user_id)
