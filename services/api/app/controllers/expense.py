from __future__ import annotations

from decimal import ROUND_FLOOR, ROUND_HALF_UP, Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers.exceptions import (
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


CENT = Decimal("0.01")


def _allocate(amount: Decimal, weights: list[Decimal]) -> list[Decimal]:
    """
    Splits amount in proportion to weights, to the cent. Leftover cents go to
    the largest fractional remainders (earliest row on ties), so the parts
    always add up to amount exactly.
    """
    total_cents = int((amount * 100).to_integral_value())
    total_weight = sum(weights)
    raw = [Decimal(total_cents) * w / total_weight for w in weights]
    cents = [int(r.to_integral_value(rounding=ROUND_FLOOR)) for r in raw]
    leftover = total_cents - sum(cents)
    by_remainder = sorted(range(len(raw)), key=lambda i: raw[i] - cents[i], reverse=True)
    for i in by_remainder[:leftover]:
        cents[i] += 1
    return [(Decimal(c) / 100).quantize(CENT) for c in cents]


def _validate_splits(
    amount: Decimal,
    split_type: SplitType,
    splits: list[ExpenseSplitCreate],
) -> None:
    """
    Validates splits and rewrites amount_owed so the splits always sum to the
    expense amount exactly. EQUAL and PERCENTAGE amounts are computed here
    (client amounts are ignored); UNEQUAL amounts must already add up.
    """
    if not splits:
        raise ValidationError("Expense must have at least one split record")

    user_ids = [s.user_id for s in splits]
    if len(set(user_ids)) != len(user_ids):
        raise ValidationError("Each person can appear only once in a split")

    if split_type == SplitType.PERCENTAGE:
        if any(s.percentage is None for s in splits):
            raise ValidationError("Every person in a percentage split needs a percentage")
        total_pct = sum(s.percentage for s in splits)
        if abs(total_pct - Decimal("100.00")) > CENT:
            raise ValidationError(
                f"Percentage splits must sum to 100%. Given: {total_pct}%"
            )
        for s, owed in zip(splits, _allocate(amount, [s.percentage for s in splits])):
            s.amount_owed = owed

    elif split_type == SplitType.EQUAL:
        for s, owed in zip(splits, _allocate(amount, [Decimal(1)] * len(splits))):
            s.amount_owed = owed
            s.percentage = None

    elif split_type == SplitType.UNEQUAL:
        for s in splits:
            s.amount_owed = s.amount_owed.quantize(CENT, rounding=ROUND_HALF_UP)
            s.percentage = None
        total_owed = sum(s.amount_owed for s in splits)
        if total_owed != amount:
            raise ValidationError(
                f"Split amounts total ({total_owed}) must equal expense amount ({amount})"
            )
        if total_owed <= 0:
            raise ValidationError("At least one person must owe something")


def _check_group_people(
    db: Session,
    group_id: UUID,
    current_user: User,
    paid_by_id: UUID,
    splits: list[ExpenseSplitCreate],
) -> None:
    """The caller, the payer and everyone in the split must be active members."""
    group = group_repo.get_group_by_id(db, group_id)
    if not group:
        raise GroupNotFoundError("Group not found")

    member_user_ids = {m.user_id for m in group_repo.get_group_members(db, group_id)}

    if current_user.id not in member_user_ids:
        raise PermissionDeniedError("You are not a member of this group")

    if paid_by_id not in member_user_ids:
        raise ValidationError("Payer must be a member of the group")

    for split in splits:
        if split.user_id not in member_user_ids:
            raise ValidationError(
                f"Split user {split.user_id} is not a member of the group"
            )


def _check_personal_people(current_user: User, paid_by_id: UUID, splits: list[ExpenseSplitCreate]) -> None:
    """A personal expense is only ever the current user's own spending."""
    if paid_by_id != current_user.id or any(s.user_id != current_user.id for s in splits):
        raise ValidationError("Add the expense to a group to split it with other people")


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

    schema.amount = schema.amount.quantize(CENT, rounding=ROUND_HALF_UP)

    if schema.group_id is not None:
        _check_group_people(db, schema.group_id, current_user, schema.paid_by_id, schema.splits)
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
        _check_personal_people(current_user, schema.paid_by_id, schema.splits)

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
    filters: expense_repo.ExpenseFilters | None = None,
    include_group_expenses: bool = False,
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

        return expense_repo.get_group_expenses(db, group_id, skip=skip, limit=limit, filters=filters)

    return expense_repo.get_user_expenses(
        db,
        current_user.id,
        skip=skip,
        limit=limit,
        filters=filters,
        include_group_expenses=include_group_expenses,
    )


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

    if schema.amount is not None:
        schema.amount = schema.amount.quantize(CENT, rounding=ROUND_HALF_UP)

    fields = schema.model_fields_set
    target_amount = schema.amount if schema.amount is not None else expense.amount
    target_split_type = schema.split_type if schema.split_type is not None else expense.split_type
    target_group_id = schema.group_id if "group_id" in fields else expense.group_id
    target_paid_by_id = schema.paid_by_id if schema.paid_by_id is not None else expense.paid_by_id

    # Changing the amount or split type re-splits the existing people, so the
    # stored splits never drift from the expense amount.
    if schema.splits is None and fields & {"amount", "split_type", "group_id", "paid_by_id"}:
        schema.splits = [
            ExpenseSplitCreate(user_id=s.user_id, amount_owed=s.amount_owed, percentage=s.percentage)
            for s in expense.splits
        ]

    if schema.splits is not None:
        if target_group_id is not None:
            _check_group_people(db, target_group_id, current_user, target_paid_by_id, schema.splits)
        else:
            _check_personal_people(current_user, target_paid_by_id, schema.splits)
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
