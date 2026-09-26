from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.recurring_expense import RecurringExpense


def get_recurring_by_id(db: Session, recurring_id: UUID) -> RecurringExpense | None:
    return db.get(RecurringExpense, recurring_id)


def get_user_recurring(db: Session, user_id: UUID) -> list[RecurringExpense]:
    stmt = (
        select(RecurringExpense)
        .where(RecurringExpense.created_by_id == user_id, RecurringExpense.group_id.is_(None))
        .order_by(RecurringExpense.is_active.desc(), RecurringExpense.next_run_date.asc())
    )
    return list(db.execute(stmt).scalars().all())


def save(db: Session, rule: RecurringExpense) -> RecurringExpense:
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def delete(db: Session, rule: RecurringExpense) -> None:
    db.delete(rule)
    db.commit()
