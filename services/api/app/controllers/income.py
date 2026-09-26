from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers.exceptions import NotFoundError, PermissionDeniedError
from app.models.income import Income
from app.models.user import User
from app.repositories import income as income_repo
from app.schemas.income import IncomeCreate, IncomeUpdate


def _owned(db: Session, income_id: UUID, current_user: User) -> Income:
    income = income_repo.get_income_by_id(db, income_id)
    if not income:
        raise NotFoundError("Income not found")
    if income.user_id != current_user.id:
        raise PermissionDeniedError("Access to income denied")
    return income


def list_incomes(
    db: Session,
    current_user: User,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = 100,
) -> list[Income]:
    return income_repo.get_user_incomes(db, current_user.id, date_from, date_to, limit)


def create_income(db: Session, current_user: User, schema: IncomeCreate) -> Income:
    income = Income(
        user_id=current_user.id,
        amount=schema.amount,
        currency=schema.currency or current_user.default_currency,
        date=schema.date,
        source=schema.source.strip(),
        notes=schema.notes,
    )
    return income_repo.save(db, income)


def update_income(db: Session, income_id: UUID, current_user: User, schema: IncomeUpdate) -> Income:
    income = _owned(db, income_id, current_user)
    for field, value in schema.model_dump(exclude_unset=True).items():
        if value is not None or field == "notes":
            setattr(income, field, value)
    return income_repo.save(db, income)


def delete_income(db: Session, income_id: UUID, current_user: User) -> None:
    income_repo.delete(db, _owned(db, income_id, current_user))
