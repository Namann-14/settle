from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers import recurring as recurring_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.recurring import (
    RecurringCreate,
    RecurringResponse,
    RecurringSyncRequest,
    RecurringSyncResponse,
    RecurringUpdate,
)

router = APIRouter(
    prefix="/recurring",
    tags=["recurring"],
)


@router.get("", response_model=list[RecurringResponse])
def list_recurring(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List the user's personal recurring expenses.
    """
    with handle_controller_errors():
        return recurring_controller.list_recurring(db, current_user)


@router.post("", response_model=RecurringResponse, status_code=status.HTTP_201_CREATED)
def create_recurring(
    schema: RecurringCreate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Create a personal recurring expense (rent, subscriptions, ...).
    """
    with handle_controller_errors():
        return recurring_controller.create_recurring(db, current_user, schema)


@router.post("/sync", response_model=RecurringSyncResponse)
def sync_recurring(
    schema: RecurringSyncRequest,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Create expenses for every recurring occurrence due on or before `today`.
    Idempotent: calling it again creates nothing new.
    """
    with handle_controller_errors():
        return RecurringSyncResponse(created=recurring_controller.sync_recurring(db, current_user, schema.today))


@router.patch("/{recurring_id}", response_model=RecurringResponse)
def update_recurring(
    recurring_id: UUID,
    schema: RecurringUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update, pause or resume a recurring expense.
    """
    with handle_controller_errors():
        return recurring_controller.update_recurring(db, recurring_id, current_user, schema)


@router.delete("/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring(
    recurring_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Delete a recurring expense. Expenses it already created are kept.
    """
    with handle_controller_errors():
        recurring_controller.delete_recurring(db, recurring_id, current_user)
        return None
