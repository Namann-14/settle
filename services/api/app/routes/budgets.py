from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers import budget as budget_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.budget import BudgetResponse, BudgetUpsert

router = APIRouter(
    prefix="/budgets",
    tags=["budgets"],
)


@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List the user's monthly budgets (overall and per category).
    """
    with handle_controller_errors():
        return budget_controller.list_budgets(db, current_user)


@router.put("", response_model=BudgetResponse)
def upsert_budget(
    schema: BudgetUpsert,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Set the monthly budget for a category, or the overall budget when
    category_id is null. Creates it the first time, updates it after.
    """
    with handle_controller_errors():
        return budget_controller.upsert_budget(db, current_user, schema)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Remove a budget.
    """
    with handle_controller_errors():
        budget_controller.delete_budget(db, budget_id, current_user)
        return None
