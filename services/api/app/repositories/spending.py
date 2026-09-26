"""
Reads behind the spending tracker. Every figure is the user's own share:
their ExpenseSplit.amount_owed. A personal expense carries a single 100% split
for its owner and a group expense carries the user's slice of it, so one join
covers both.

The database is remote, so round trips dominate: the summary fetches the raw
split rows for its whole window in one query and aggregates in Python rather
than issuing one GROUP BY per figure.
"""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.models.expense_split import ExpenseSplit
from app.models.income import Income

ZERO = Decimal("0.00")


@dataclass(frozen=True)
class SplitRow:
    date: date
    currency: str
    personal: bool
    category_id: UUID | None
    category_name: str | None
    category_icon: str | None
    category_color: str | None
    # merchant, falling back to the description, so "Netflix" still groups
    label: str
    amount: Decimal


def split_rows(db: Session, user_id: UUID, date_from: date, date_to: date) -> list[SplitRow]:
    """The user's share of every live expense dated inside [date_from, date_to]."""
    label = func.coalesce(func.nullif(func.trim(Expense.merchant), ""), Expense.description)
    stmt = (
        select(
            Expense.date,
            Expense.currency,
            Expense.group_id.is_(None),
            Expense.category_id,
            Category.name,
            Category.icon,
            Category.color,
            label,
            ExpenseSplit.amount_owed,
        )
        .select_from(ExpenseSplit)
        .join(Expense, Expense.id == ExpenseSplit.expense_id)
        .outerjoin(Category, Category.id == Expense.category_id)
        .where(
            ExpenseSplit.user_id == user_id,
            Expense.deleted_at.is_(None),
            Expense.date >= date_from,
            Expense.date <= date_to,
        )
    )
    return [SplitRow(*row) for row in db.execute(stmt).all()]


def budgets_with_categories(db: Session, user_id: UUID) -> list[Budget]:
    # Eager-load the category so budgets with no spend yet don't lazy-load one by one.
    stmt = select(Budget).options(joinedload(Budget.category)).where(Budget.user_id == user_id)
    return list(db.execute(stmt).scalars().all())


def income_total(db: Session, user_id: UUID, currency: str, date_from: date, date_to: date) -> Decimal:
    stmt = select(func.coalesce(func.sum(Income.amount), 0)).where(
        Income.user_id == user_id,
        Income.currency == currency,
        Income.date >= date_from,
        Income.date <= date_to,
    )
    return Decimal(db.execute(stmt).scalar_one())
