from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import expense as expense_controller
from app.dependencies.database import get_db
from app.models.user import User
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
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List expenses for the authenticated user or for a specific group.
    """
    with handle_controller_errors():
        return expense_controller.list_user_expenses(
            db, current_user, skip=skip, limit=limit, group_id=group_id
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
