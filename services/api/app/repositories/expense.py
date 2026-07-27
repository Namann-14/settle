from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.expense import Expense
from app.models.expense_split import ExpenseSplit
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def get_expense_by_id(db: Session, expense_id: UUID, include_deleted: bool = False) -> Expense | None:
    stmt = select(Expense).options(joinedload(Expense.splits)).where(Expense.id == expense_id)
    if not include_deleted:
        stmt = stmt.where(Expense.deleted_at.is_(None))
    return db.execute(stmt).scalar_one_or_none()


def get_user_expenses(
    db: Session, user_id: UUID, skip: int = 0, limit: int = 50, include_deleted: bool = False
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
    stmt = stmt.order_by(Expense.date.desc(), Expense.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


def get_group_expenses(
    db: Session, group_id: UUID, skip: int = 0, limit: int = 50, include_deleted: bool = False
) -> list[Expense]:
    stmt = (
        select(Expense)
        .options(joinedload(Expense.splits))
        .where(Expense.group_id == group_id)
    )
    if not include_deleted:
        stmt = stmt.where(Expense.deleted_at.is_(None))
    stmt = stmt.order_by(Expense.date.desc(), Expense.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


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
