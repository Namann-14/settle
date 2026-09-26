from datetime import date
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import expense as expense_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.repositories.expense import ExpenseFilters
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    schema: ExpenseCreate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Create a new expense (personal or group-based).
    """
    with handle_controller_errors():
        return expense_controller.create_expense(db, current_user, schema)


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    group_id: UUID | None = Query(default=None),
    q: str | None = Query(default=None, max_length=200, description="Search description or merchant"),
    category_id: UUID | None = Query(default=None),
    paid_by_id: UUID | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    scope: Literal["personal", "group"] | None = Query(default=None, description="personal = no group"),
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List expenses for the authenticated user or for a specific group, with
    optional search and filters.
    """
    filters = ExpenseFilters(
        q=q, category_id=category_id, paid_by_id=paid_by_id, date_from=date_from, date_to=date_to, scope=scope
    )
    with handle_controller_errors():
        return expense_controller.list_user_expenses(
            db, current_user, skip=skip, limit=limit, group_id=group_id, filters=filters
        )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve expense details by ID.
    """
    with handle_controller_errors():
        return expense_controller.get_expense(db, expense_id, current_user)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: UUID,
    schema: ExpenseUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update an expense. Only the expense creator is authorized.
    """
    with handle_controller_errors():
        return expense_controller.update_expense(db, expense_id, current_user, schema)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Delete an expense. Only the expense creator is authorized.
    """
    with handle_controller_errors():
        expense_controller.delete_expense(db, expense_id, current_user)
        return None
