from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers import (
    GroupNotFoundError,
    PermissionDeniedError,
    SettlementNotFoundError,
    UserNotFoundError,
    ValidationError,
)
from app.models.settlement import Settlement
from app.models.user import User

from app.repositories import group as group_repo
from app.repositories import settlement as settlement_repo
from app.repositories import user as user_repo
from app.schemas.settlement import SettlementCreate, SettlementUpdate


def create_settlement(
    db: Session,
    current_user: User,
    schema: SettlementCreate,
) -> Settlement:
    """
    Creates a new settlement between two users.
    """
    # Rule: Settlement amount must be > 0
    if schema.amount <= Decimal("0.00"):
        raise ValidationError("Settlement amount must be greater than zero")

    # Rule: Cannot settle with yourself
    if schema.paid_by_id == schema.received_by_id:
        raise ValidationError("Cannot create a settlement with yourself")

    # Verify both users exist
    paid_by_user = user_repo.get_user_by_id(db, schema.paid_by_id)
    if not paid_by_user:
        raise UserNotFoundError("Payer user not found")

    received_by_user = user_repo.get_user_by_id(db, schema.received_by_id)
    if not received_by_user:
        raise UserNotFoundError("Recipient user not found")

    # Set created_by_id
    schema.created_by_id = current_user.id

    # Rule: Both users must belong to the group if group_id is provided
    if schema.group_id is not None:
        group = group_repo.get_group_by_id(db, schema.group_id)
        if not group:
            raise GroupNotFoundError("Group not found")

        members = group_repo.get_group_members(db, schema.group_id)
        active_member_ids = {m.user_id for m in members}

        if current_user.id not in active_member_ids:
            raise PermissionDeniedError("You are not a member of this group")

        if schema.paid_by_id not in active_member_ids:
            raise ValidationError("Payer must be a member of the group")

        if schema.received_by_id not in active_member_ids:
            raise ValidationError("Recipient must be a member of the group")
    else:
        # Personal settlement validation: current user must be party to the settlement
        if current_user.id not in (schema.paid_by_id, schema.received_by_id):
            raise PermissionDeniedError("You must be an involved party in a personal settlement")

    return settlement_repo.create_settlement(db, schema)


def get_settlement(
    db: Session,
    settlement_id: UUID,
    current_user: User,
) -> Settlement:
    """
    Retrieves a settlement by ID, verifying access permissions.
    """
    settlement = settlement_repo.get_settlement_by_id(db, settlement_id)
    if not settlement:
        raise SettlementNotFoundError("Settlement not found")

    is_party = current_user.id in (settlement.paid_by_id, settlement.received_by_id, settlement.created_by_id)

    is_group_member = False
    if settlement.group_id is not None:
        members = group_repo.get_group_members(db, settlement.group_id)
        is_group_member = any(m.user_id == current_user.id for m in members)

    if not (is_party or is_group_member):
        raise PermissionDeniedError("Access to settlement denied")

    return settlement


def list_user_settlements(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
    group_id: UUID | None = None,
) -> list[Settlement]:
    """
    Lists settlements for the current user or a specific group.
    """
    if group_id is not None:
        group = group_repo.get_group_by_id(db, group_id)
        if not group:
            raise GroupNotFoundError("Group not found")

        members = group_repo.get_group_members(db, group_id)
        if not any(m.user_id == current_user.id for m in members):
            raise PermissionDeniedError("You are not a member of this group")

        return settlement_repo.get_group_settlements(db, group_id, skip=skip, limit=limit)

    return settlement_repo.get_user_settlements(db, current_user.id, skip=skip, limit=limit)


def update_settlement(
    db: Session,
    settlement_id: UUID,
    current_user: User,
    schema: SettlementUpdate,
) -> Settlement:
    """
    Updates a settlement. Authorized for creator or payer.
    """
    settlement = settlement_repo.get_settlement_by_id(db, settlement_id)
    if not settlement:
        raise SettlementNotFoundError("Settlement not found")

    if current_user.id not in (settlement.created_by_id, settlement.paid_by_id):
        raise PermissionDeniedError("Only the creator or payer may update this settlement")

    if schema.amount is not None and schema.amount <= Decimal("0.00"):
        raise ValidationError("Settlement amount must be greater than zero")

    return settlement_repo.update_settlement(db, settlement, schema)


def delete_settlement(
    db: Session,
    settlement_id: UUID,
    current_user: User,
) -> bool:
    """
    Deletes a settlement. Authorized for creator or payer.
    """
    settlement = settlement_repo.get_settlement_by_id(db, settlement_id)
    if not settlement:
        raise SettlementNotFoundError("Settlement not found")

    if current_user.id not in (settlement.created_by_id, settlement.paid_by_id):
        raise PermissionDeniedError("Only the creator or payer may delete this settlement")

    return settlement_repo.delete_settlement(db, settlement)
