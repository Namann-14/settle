from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers import (
    ConflictError,
    GroupNotFoundError,
    PermissionDeniedError,
    UserNotFoundError,
    ValidationError,
)
from app.db.enums import GroupRole
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.user import User

from app.repositories import group as group_repo
from app.repositories import user as user_repo
from app.schemas.group import GroupCreate, GroupUpdate
from app.schemas.group_member import GroupMemberCreate


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
