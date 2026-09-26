from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers.exceptions import NotFoundError, PermissionDeniedError, ValidationError
from app.controllers import category as category_controller
from app.db.enums import SplitType
from app.models.recurring_expense import RecurringExpense
from app.models.user import User
from app.repositories import recurring as recurring_repo
from app.schemas.recurring import RecurringCreate, RecurringUpdate
from app.services.recurrence import materialize_due, next_date


def _owned(db: Session, recurring_id: UUID, current_user: User) -> RecurringExpense:
    rule = recurring_repo.get_recurring_by_id(db, recurring_id)
    if not rule:
        raise NotFoundError("Recurring expense not found")
    if rule.created_by_id != current_user.id or rule.group_id is not None:
        raise PermissionDeniedError("Access to recurring expense denied")
    return rule


def list_recurring(db: Session, current_user: User) -> list[RecurringExpense]:
    return recurring_repo.get_user_recurring(db, current_user.id)


def create_recurring(db: Session, current_user: User, schema: RecurringCreate) -> RecurringExpense:
    """
    Creates a personal recurring expense. The first occurrence is start_date;
    nothing is written to the ledger until the next sync reaches it.
    """
    if schema.category_id is not None:
        category_controller.get_category(db, schema.category_id, current_user)

    rule = RecurringExpense(
        description=schema.description.strip(),
        amount=schema.amount,
        currency=schema.currency or current_user.default_currency,
        split_type=SplitType.EQUAL,
        frequency=schema.frequency,
        interval=schema.interval,
        start_date=schema.start_date,
        end_date=schema.end_date,
        next_run_date=schema.start_date,
        is_active=True,
        group_id=None,
        category_id=schema.category_id,
        paid_by_id=current_user.id,
        created_by_id=current_user.id,
    )
    return recurring_repo.save(db, rule)


def update_recurring(
    db: Session, recurring_id: UUID, current_user: User, schema: RecurringUpdate
) -> RecurringExpense:
    rule = _owned(db, recurring_id, current_user)
    data = schema.model_dump(exclude_unset=True)
    resuming = data.get("is_active") is True and not rule.is_active
    if data.get("category_id") is not None:
        category_controller.get_category(db, data["category_id"], current_user)
    for field, value in data.items():
        # Nullable fields may be cleared; the rest ignore an explicit null.
        if value is not None or field in {"category_id", "end_date"}:
            setattr(rule, field, value)
    if rule.end_date is not None and rule.end_date < rule.start_date:
        raise ValidationError("end_date must be on or after start_date")
    if resuming:
        # Resuming skips what was missed while paused instead of back-filling it.
        today = date.today()
        while rule.next_run_date < today:
            rule.next_run_date = next_date(rule.next_run_date, rule.frequency, rule.interval, rule.start_date.day)
    return recurring_repo.save(db, rule)


def delete_recurring(db: Session, recurring_id: UUID, current_user: User) -> None:
    """Removes the rule. Expenses it already created stay (their link is nulled)."""
    recurring_repo.delete(db, _owned(db, recurring_id, current_user))


def sync_recurring(db: Session, current_user: User, today: date) -> int:
    # The client sends its local date; anything further than a day from ours
    # is a skewed clock or a bad actor trying to pre-create future expenses.
    if abs((today - date.today()).days) > 1:
        raise ValidationError("today is too far from the server date")
    return materialize_due(db, current_user.id, today)

