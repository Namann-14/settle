from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import Budget


def get_budget_by_id(db: Session, budget_id: UUID) -> Budget | None:
    return db.get(Budget, budget_id)


def get_user_budgets(db: Session, user_id: UUID) -> list[Budget]:
    stmt = select(Budget).where(Budget.user_id == user_id).order_by(Budget.created_at.asc())
    return list(db.execute(stmt).scalars().all())


def get_user_budget_for_category(db: Session, user_id: UUID, category_id: UUID | None) -> Budget | None:
    stmt = select(Budget).where(Budget.user_id == user_id)
    stmt = stmt.where(Budget.category_id.is_(None) if category_id is None else Budget.category_id == category_id)
    return db.execute(stmt).scalar_one_or_none()


def save(db: Session, budget: Budget) -> Budget:
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def delete(db: Session, budget: Budget) -> None:
    db.delete(budget)
    db.commit()
