from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.income import Income


def get_income_by_id(db: Session, income_id: UUID) -> Income | None:
    return db.get(Income, income_id)


def get_user_incomes(
    db: Session,
    user_id: UUID,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = 100,
) -> list[Income]:
    stmt = select(Income).where(Income.user_id == user_id)
    if date_from:
        stmt = stmt.where(Income.date >= date_from)
    if date_to:
        stmt = stmt.where(Income.date <= date_to)
    stmt = stmt.order_by(Income.date.desc(), Income.created_at.desc()).limit(limit)
    return list(db.execute(stmt).scalars().all())


def save(db: Session, income: Income) -> Income:
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


def delete(db: Session, income: Income) -> None:
    db.delete(income)
    db.commit()
