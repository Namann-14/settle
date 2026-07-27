from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import settlement as settlement_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.settlement import SettlementCreate, SettlementResponse, SettlementUpdate

router = APIRouter(
    prefix="/settlements",
    tags=["settlements"],
)


@router.post("", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
def create_settlement(
    schema: SettlementCreate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Create a new settlement between two users.
    """
    with handle_controller_errors():
        return settlement_controller.create_settlement(db, current_user, schema)


@router.get("", response_model=list[SettlementResponse])
def list_settlements(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    group_id: UUID | None = Query(default=None),
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List settlements for the authenticated user or for a specific group.
    """
    with handle_controller_errors():
        return settlement_controller.list_user_settlements(
            db, current_user, skip=skip, limit=limit, group_id=group_id
        )


@router.get("/{settlement_id}", response_model=SettlementResponse)
def get_settlement(
    settlement_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve settlement details by ID.
    """
    with handle_controller_errors():
        return settlement_controller.get_settlement(db, settlement_id, current_user)


@router.patch("/{settlement_id}", response_model=SettlementResponse)
def update_settlement(
    settlement_id: UUID,
    schema: SettlementUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update a settlement. Authorized for creator or payer.
    """
    with handle_controller_errors():
        return settlement_controller.update_settlement(db, settlement_id, current_user, schema)


@router.delete("/{settlement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_settlement(
    settlement_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Delete a settlement. Authorized for creator or payer.
    """
    with handle_controller_errors():
        settlement_controller.delete_settlement(db, settlement_id, current_user)
        return None
