from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.enums import GroupRole
from app.models.group import Group
from app.models.group_member import GroupMember
from app.schemas.group import GroupCreate, GroupUpdate
from app.schemas.group_member import GroupMemberCreate, GroupMemberUpdate


def get_group_by_id(db: Session, group_id: UUID, include_deleted: bool = False) -> Group | None:
    stmt = select(Group).options(joinedload(Group.members)).where(Group.id == group_id)
    if not include_deleted:
        stmt = stmt.where(Group.deleted_at.is_(None))
    return db.execute(stmt).scalar_one_or_none()


def get_user_groups(db: Session, user_id: UUID, include_deleted: bool = False) -> list[Group]:
    stmt = (
        select(Group)
        .options(joinedload(Group.members))
        .join(GroupMember, Group.id == GroupMember.group_id)
        .where(GroupMember.user_id == user_id, GroupMember.removed_at.is_(None))
    )
    if not include_deleted:
        stmt = stmt.where(Group.deleted_at.is_(None))
    stmt = stmt.order_by(Group.created_at.desc())
    return list(db.execute(stmt).scalars().unique().all())


def create_group(db: Session, schema: GroupCreate) -> Group:
    group = Group(
        name=schema.name,
        description=schema.description,
        default_currency=schema.default_currency,
        created_by_id=schema.created_by_id,
    )
    db.add(group)
    db.flush()

    # Automatically add creator as ADMIN
    admin_member = GroupMember(
        group_id=group.id,
        user_id=schema.created_by_id,
        role=GroupRole.ADMIN,
    )
    db.add(admin_member)

    db.commit()
    db.refresh(group)
    return group


def update_group(db: Session, group: Group, schema: GroupUpdate) -> Group:
    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


def delete_group(db: Session, group: Group, soft_delete: bool = True) -> bool:
    if soft_delete:
        group.deleted_at = datetime.now(timezone.utc)
        db.add(group)
    else:
        db.delete(group)
    db.commit()
    return True


# Group Member Operations

def add_group_member(db: Session, schema: GroupMemberCreate) -> GroupMember:
    # Check if user was previously removed or is already a member
    stmt = select(GroupMember).where(
        GroupMember.group_id == schema.group_id,
        GroupMember.user_id == schema.user_id,
    )
    existing_member = db.execute(stmt).scalar_one_or_none()

    if existing_member:
        existing_member.removed_at = None
        existing_member.role = schema.role
        db.add(existing_member)
        db.commit()
        db.refresh(existing_member)
        return existing_member

    member = GroupMember(
        group_id=schema.group_id,
        user_id=schema.user_id,
        role=schema.role,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def update_group_member(db: Session, member: GroupMember, schema: GroupMemberUpdate) -> GroupMember:
    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def remove_group_member(db: Session, group_id: UUID, user_id: UUID, soft_remove: bool = True) -> bool:
    stmt = select(GroupMember).where(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id,
    )
    member = db.execute(stmt).scalar_one_or_none()
    if not member:
        return False

    if soft_remove:
        member.removed_at = datetime.now(timezone.utc)
        db.add(member)
    else:
        db.delete(member)
    db.commit()
    return True


def get_group_members(db: Session, group_id: UUID, include_removed: bool = False) -> list[GroupMember]:
    stmt = select(GroupMember).where(GroupMember.group_id == group_id)
    if not include_removed:
        stmt = stmt.where(GroupMember.removed_at.is_(None))
    return list(db.execute(stmt).scalars().all())
