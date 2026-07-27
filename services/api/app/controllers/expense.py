from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers import (
    ExpenseNotFoundError,
    GroupNotFoundError,
    PermissionDeniedError,
    ValidationError,
)
from app.db.enums import SplitType
from app.models.expense import Expense
from app.models.user import User

from app.repositories import expense as expense_repo
from app.repositories import group as group_repo
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.schemas.expense_split import ExpenseSplitCreate


def _validate_splits(
    amount: Decimal,
    split_type: SplitType,
    splits: list[ExpenseSplitCreate],
) -> None:
    """
    Validates split totals and strategy against expense amount.
    """
    if not splits:
        raise ValidationError("Expense must have at least one split record")

    if split_type == SplitType.PERCENTAGE:
        total_pct = sum(s.percentage or Decimal("0.00") for s in splits)
        if abs(total_pct - Decimal("100.00")) > Decimal("0.01"):
            raise ValidationError(
                f"Percentage splits must sum to 100%. Given: {total_pct}%"
            )
        for s in splits:
            if s.percentage is not None:
                calculated_owed = (s.percentage / Decimal("100.00")) * amount
                if abs(s.amount_owed - calculated_owed) > Decimal("0.05") or s.amount_owed == Decimal("0.00"):
                    s.amount_owed = round(calculated_owed, 2)

    elif split_type == SplitType.EQUAL:
        count = Decimal(len(splits))
        equal_share = round(amount / count, 2)
        total_owed = sum(s.amount_owed for s in splits)
        if total_owed == Decimal("0.00") or abs(total_owed - amount) > Decimal("0.05"):
            remainder = amount - (equal_share * count)
            for idx, s in enumerate(splits):
                s.amount_owed = equal_share + (remainder if idx == 0 else Decimal("0.00"))

    elif split_type == SplitType.UNEQUAL:
        total_owed = sum(s.amount_owed for s in splits)
        if abs(total_owed - amount) > Decimal("0.01"):
            raise ValidationError(
                f"Split amounts total ({total_owed}) must equal expense amount ({amount})"
            )


def create_expense(
    db: Session,
    current_user: User,
    schema: ExpenseCreate,
) -> Expense:
    """
    Creates a new expense (personal or group) with validated splits.
    """
    # Enforce current user as creator
    schema.created_by_id = current_user.id

    # Default paid_by_id to current_user if omitted
    if not schema.paid_by_id:
        schema.paid_by_id = current_user.id

    # Group validation if group_id is provided
    if schema.group_id is not None:
        group = group_repo.get_group_by_id(db, schema.group_id)
        if not group:
            raise GroupNotFoundError("Group not found")

        members = group_repo.get_group_members(db, schema.group_id)
        member_user_ids = {m.user_id for m in members}

        if current_user.id not in member_user_ids:
            raise PermissionDeniedError("You are not a member of this group")

        if schema.paid_by_id not in member_user_ids:
            raise ValidationError("Payer must be a member of the group")

        for split in schema.splits:
            if split.user_id not in member_user_ids:
                raise ValidationError(
                    f"Split user {split.user_id} is not a member of the group"
                )
    else:
        # Personal expense default split if splits list is empty
        if not schema.splits:
            schema.splits = [
                ExpenseSplitCreate(
                    user_id=schema.paid_by_id,
                    amount_owed=schema.amount,
                    percentage=Decimal("100.00") if schema.split_type == SplitType.PERCENTAGE else None,
                )
            ]

    # Validate split totals and rules
    _validate_splits(schema.amount, schema.split_type, schema.splits)

    return expense_repo.create_expense(db, schema)


def get_expense(
    db: Session,
    expense_id: UUID,
    current_user: User,
) -> Expense:
    """
    Retrieves an expense by ID, verifying user access permissions.
    """
    expense = expense_repo.get_expense_by_id(db, expense_id)
    if not expense:
        raise ExpenseNotFoundError("Expense not found")

    # Access check: creator, payer, split participant, or group member
    is_creator = expense.created_by_id == current_user.id
    is_payer = expense.paid_by_id == current_user.id
    is_participant = any(s.user_id == current_user.id for s in expense.splits)

    is_group_member = False
    if expense.group_id is not None:
        members = group_repo.get_group_members(db, expense.group_id)
        is_group_member = any(m.user_id == current_user.id for m in members)

    if not (is_creator or is_payer or is_participant or is_group_member):
        raise PermissionDeniedError("Access to expense denied")

    return expense


def list_user_expenses(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
    group_id: UUID | None = None,
) -> list[Expense]:
    """
    Lists expenses for the current user or a specific group.
    """
    if group_id is not None:
        group = group_repo.get_group_by_id(db, group_id)
        if not group:
            raise GroupNotFoundError("Group not found")

        members = group_repo.get_group_members(db, group_id)
        if not any(m.user_id == current_user.id for m in members):
            raise PermissionDeniedError("You are not a member of this group")

        return expense_repo.get_group_expenses(db, group_id, skip=skip, limit=limit)

    return expense_repo.get_user_expenses(db, current_user.id, skip=skip, limit=limit)


def update_expense(
    db: Session,
    expense_id: UUID,
    current_user: User,
    schema: ExpenseUpdate,
) -> Expense:
    """
    Updates an existing expense. Only the creator may edit an expense.
    """
    expense = expense_repo.get_expense_by_id(db, expense_id)
    if not expense:
        raise ExpenseNotFoundError("Expense not found")

    if expense.created_by_id != current_user.id:
        raise PermissionDeniedError("Only the creator may edit this expense")

    # If splits or amount are updated, re-validate splits
    if schema.splits is not None:
        target_amount = schema.amount if schema.amount is not None else expense.amount
        target_split_type = schema.split_type if schema.split_type is not None else expense.split_type
        _validate_splits(target_amount, target_split_type, schema.splits)

    return expense_repo.update_expense(db, expense, schema)


def delete_expense(
    db: Session,
    expense_id: UUID,
    current_user: User,
) -> bool:
    """
    Deletes an expense. Only the creator may delete an expense.
    """
    expense = expense_repo.get_expense_by_id(db, expense_id)
    if not expense:
        raise ExpenseNotFoundError("Expense not found")

    if expense.created_by_id != current_user.id:
        raise PermissionDeniedError("Only the creator may delete this expense")

    return expense_repo.delete_expense(db, expense)
