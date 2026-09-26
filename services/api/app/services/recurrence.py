from __future__ import annotations

import calendar
from datetime import date, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.enums import Frequency, SplitType
from app.models.expense import Expense
from app.models.expense_split import ExpenseSplit
from app.models.recurring_expense import RecurringExpense

# Cap on back-filled occurrences per rule per sync, so a rule dated years ago
# (or a daily one left alone for months) can't flood the ledger in one call.
MAX_CATCH_UP = 24


def _add_months(d: date, months: int, anchor_day: int) -> date:
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    day = min(anchor_day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def next_date(current: date, frequency: Frequency, interval: int = 1, anchor_day: int | None = None) -> date:
    """
    The occurrence after `current`. Monthly and yearly rules keep `anchor_day`
    (the start date's day of month) and clamp to month end, so a rule started
    on Jan 31 runs Feb 28/29, then Mar 31 again rather than drifting to the 28th.
    """
    anchor = anchor_day or current.day
    if frequency == Frequency.DAILY:
        return current + timedelta(days=interval)
    if frequency == Frequency.WEEKLY:
        return current + timedelta(weeks=interval)
    if frequency == Frequency.MONTHLY:
        return _add_months(current, interval, anchor)
    if frequency == Frequency.YEARLY:
        return _add_months(current, 12 * interval, anchor)
    raise ValueError(f"Unknown frequency: {frequency}")


def materialize_due(db: Session, user_id: UUID, today: date) -> int:
    """
    Create an expense for every occurrence of the user's active recurring rules
    that is due on or before `today`, and advance each rule. Rows are locked so
    two concurrent syncs (e.g. two open tabs) never create the same occurrence.
    Returns the number of expenses created.
    """
    stmt = (
        select(RecurringExpense)
        .where(
            RecurringExpense.created_by_id == user_id,
            RecurringExpense.group_id.is_(None),
            RecurringExpense.is_active.is_(True),
            RecurringExpense.next_run_date <= today,
        )
        .with_for_update(skip_locked=True)
    )
    rules = list(db.execute(stmt).scalars().all())

    created = 0
    for rule in rules:
        run = rule.next_run_date
        for _ in range(MAX_CATCH_UP):
            if run > today:
                break
            if rule.end_date is not None and run > rule.end_date:
                break
            expense = Expense(
                description=rule.description,
                amount=rule.amount,
                currency=rule.currency,
                date=run,
                split_type=SplitType.EQUAL,
                group_id=None,
                category_id=rule.category_id,
                paid_by_id=rule.paid_by_id,
                created_by_id=rule.created_by_id,
                recurring_expense_id=rule.id,
            )
            expense.splits.append(ExpenseSplit(user_id=rule.paid_by_id, amount_owed=Decimal(rule.amount)))
            db.add(expense)
            created += 1
            run = next_date(run, rule.frequency, rule.interval, rule.start_date.day)

        rule.next_run_date = run
        if rule.end_date is not None and run > rule.end_date:
            rule.is_active = False
        db.add(rule)

    db.commit()
    return created
