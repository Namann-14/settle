from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers.exceptions import NotFoundError, PermissionDeniedError
from app.controllers import category as category_controller
from app.models.budget import Budget
from app.models.user import User
from app.repositories import budget as budget_repo
from app.schemas.budget import BudgetUpsert


def list_budgets(db: Session, current_user: User) -> list[Budget]:
    return budget_repo.get_user_budgets(db, current_user.id)


def upsert_budget(db: Session, current_user: User, schema: BudgetUpsert) -> Budget:
    """
    Sets the monthly limit for a category (or overall, when category_id is null),
    creating the budget the first time and updating it after.
    """
    if schema.category_id is not None:
        # Raises when the category is someone else's custom category.
        category_controller.get_category(db, schema.category_id, current_user)

    budget = budget_repo.get_user_budget_for_category(db, current_user.id, schema.category_id)
    if budget is None:
        budget = Budget(user_id=current_user.id, category_id=schema.category_id)
    budget.amount = schema.amount
    budget.currency = schema.currency or current_user.default_currency
    return budget_repo.save(db, budget)


def delete_budget(db: Session, budget_id: UUID, current_user: User) -> None:
    budget = budget_repo.get_budget_by_id(db, budget_id)
    if not budget:
        raise NotFoundError("Budget not found")
    if budget.user_id != current_user.id:
        raise PermissionDeniedError("Access to budget denied")
    budget_repo.delete(db, budget)
