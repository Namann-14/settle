from dataclasses import dataclass
from typing import Literal
from datetime import date, datetime, timezone
from uuid import UUID

from sqlalchemy import Select, delete, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.expense import Expense
from app.models.expense_split import ExpenseSplit
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


@dataclass
class ExpenseFilters:
    q: str | None = None
    category_id: UUID | None = None
    paid_by_id: UUID | None = None
    date_from: date | None = None
    date_to: date | None = None
    # "personal" => no group, "group" => any group, None => both
    scope: Literal["personal", "group"] | None = None


def _apply_filters(stmt: Select, filters: ExpenseFilters | None) -> Select:
    if filters is None:
        return stmt
    if filters.q:
        pattern = f"%{filters.q.strip()}%"
        stmt = stmt.where(or_(Expense.description.ilike(pattern), Expense.merchant.ilike(pattern)))
    if filters.category_id:
        stmt = stmt.where(Expense.category_id == filters.category_id)
    if filters.paid_by_id:
        stmt = stmt.where(Expense.paid_by_id == filters.paid_by_id)
    if filters.date_from:
        stmt = stmt.where(Expense.date >= filters.date_from)
    if filters.date_to:
        stmt = stmt.where(Expense.date <= filters.date_to)
    if filters.scope == "personal":
        stmt = stmt.where(Expense.group_id.is_(None))
    elif filters.scope == "group":
        stmt = stmt.where(Expense.group_id.is_not(None))
    return stmt


def get_expense_by_id(db: Session, expense_id: UUID, include_deleted: bool = False) -> Expense | None:
    stmt = select(Expense).options(joinedload(Expense.splits)).where(Expense.id == expense_id)
    if not include_deleted:
        stmt = stmt.where(Expense.deleted_at.is_(None))
    return db.execute(stmt).scalars().unique().one_or_none()


def get_user_expenses(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 50,
    include_deleted: bool = False,
    filters: ExpenseFilters | None = None,
) -> list[Expense]:
    stmt = (
        select(Expense)
        .options(joinedload(Expense.splits))
        .outerjoin(ExpenseSplit, Expense.id == ExpenseSplit.expense_id)
        .where(
            (Expense.paid_by_id == user_id)
            | (Expense.created_by_id == user_id)
            | (ExpenseSplit.user_id == user_id)
        )
        .distinct()
    )
    if not include_deleted:
        stmt = stmt.where(Expense.deleted_at.is_(None))
    stmt = _apply_filters(stmt, filters)
    stmt = stmt.order_by(Expense.date.desc(), Expense.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().unique().all())


def get_group_expenses(
    db: Session,
    group_id: UUID,
    skip: int = 0,
    limit: int = 50,
    include_deleted: bool = False,
    filters: ExpenseFilters | None = None,
) -> list[Expense]:
    stmt = (
        select(Expense)
        .options(joinedload(Expense.splits))
        .where(Expense.group_id == group_id)
    )
    if not include_deleted:
        stmt = stmt.where(Expense.deleted_at.is_(None))
    stmt = _apply_filters(stmt, filters)
    stmt = stmt.order_by(Expense.date.desc(), Expense.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().unique().all())


def get_all_group_expenses(db: Session, group_id: UUID) -> list[Expense]:
    """Every live expense in a group, unpaginated — used for balance math."""
    stmt = (
        select(Expense)
        .options(joinedload(Expense.splits))
        .where(Expense.group_id == group_id, Expense.deleted_at.is_(None))
    )
    return list(db.execute(stmt).scalars().unique().all())


def create_expense(db: Session, schema: ExpenseCreate) -> Expense:
    expense = Expense(
        description=schema.description,
        merchant=schema.merchant,
        amount=schema.amount,
        currency=schema.currency,
        date=schema.date,
        notes=schema.notes,
        split_type=schema.split_type,
        group_id=schema.group_id,
        category_id=schema.category_id,
        paid_by_id=schema.paid_by_id,
        created_by_id=schema.created_by_id,
    )
    db.add(expense)
    db.flush()  # populate expense.id

    for split in schema.splits:
        expense_split = ExpenseSplit(
            expense_id=expense.id,
            user_id=split.user_id,
            amount_owed=split.amount_owed,
            percentage=split.percentage,
            share=split.share,
        )
        db.add(expense_split)

    db.commit()
    db.refresh(expense)
    return expense


def update_expense(db: Session, expense: Expense, schema: ExpenseUpdate) -> Expense:
    update_data = schema.model_dump(exclude_unset=True)
    splits_data = update_data.pop("splits", None)

    for field, value in update_data.items():
        setattr(expense, field, value)

    if splits_data is not None:
        # Delete existing splits and insert new splits
        db.execute(delete(ExpenseSplit).where(ExpenseSplit.expense_id == expense.id))
        for split in splits_data:
            expense_split = ExpenseSplit(
                expense_id=expense.id,
                user_id=split["user_id"],
                amount_owed=split["amount_owed"],
                percentage=split.get("percentage"),
                share=split.get("share"),
            )
            db.add(expense_split)

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense: Expense, soft_delete: bool = True) -> bool:
    if soft_delete:
        expense.deleted_at = datetime.now(timezone.utc)
        db.add(expense)
    else:
        db.delete(expense)
    db.commit()
    return True
