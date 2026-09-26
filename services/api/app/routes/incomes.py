from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import income as income_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.income import IncomeCreate, IncomeResponse, IncomeUpdate

router = APIRouter(
    prefix="/incomes",
    tags=["incomes"],
)


@router.get("", response_model=list[IncomeResponse])
def list_incomes(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List the user's income entries, newest first.
    """
    with handle_controller_errors():
        return income_controller.list_incomes(db, current_user, date_from, date_to, limit)


@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(
    schema: IncomeCreate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Record income (salary, freelance payment, refund, ...).
    """
    with handle_controller_errors():
        return income_controller.create_income(db, current_user, schema)


@router.patch("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: UUID,
    schema: IncomeUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update an income entry.
    """
    with handle_controller_errors():
        return income_controller.update_income(db, income_id, current_user, schema)


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    income_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Delete an income entry.
    """
    with handle_controller_errors():
        income_controller.delete_income(db, income_id, current_user)
        return None
