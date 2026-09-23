from __future__ import annotations

from decimal import Decimal
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


def invite_by_email(
    db: Session,
    group_id: UUID,
    current_user: User,
    email: str,
    role: GroupRole = GroupRole.MEMBER,
) -> tuple[GroupMember | None, GroupInvitation | None]:
    """
    Adds a member by email. Any active member may invite. Users who already
    have an account are added immediately; anyone else gets a pending
    invitation that is claimed the first time they sign in with that email.
    """
    group, _ = _require_member(db, group_id, current_user)

    target = user_repo.get_user_by_email(db, email)
    if target:
        if _get_active_membership(group.members, target.id):
            raise ConflictError("That person is already in this group")
        member = group_repo.add_group_member(
            db, GroupMemberCreate(group_id=group_id, user_id=target.id, role=role)
        )
        return member, None

    if invitation_repo.get_pending_invitation(db, group_id, email):
        raise ConflictError("An invite for this email is already pending")
    return None, invitation_repo.create_invitation(db, group_id, email, current_user.id)


def list_invitations(db: Session, group_id: UUID, current_user: User) -> list[GroupInvitation]:
    _require_member(db, group_id, current_user)
    return invitation_repo.list_group_invitations(db, group_id)


def cancel_invitation(db: Session, group_id: UUID, invitation_id: UUID, current_user: User) -> None:
    _require_member(db, group_id, current_user)
    invitation = invitation_repo.get_invitation_by_id(db, invitation_id)
    if not invitation or invitation.group_id != group_id or invitation.status != InvitationStatus.PENDING:
        raise GroupNotFoundError("Invitation not found")
    invitation_repo.set_status(db, invitation, InvitationStatus.CANCELLED)


def claim_invitations(db: Session, user: User) -> None:
    """Turns any pending invitations for the user's email into memberships."""
    if not user.email:
        return
    for invitation in invitation_repo.list_pending_for_email(db, user.email):
        group_repo.add_group_member(
            db, GroupMemberCreate(group_id=invitation.group_id, user_id=user.id, role=GroupRole.MEMBER)
        )
        invitation_repo.set_status(db, invitation, InvitationStatus.ACCEPTED, invited_user_id=user.id)


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
