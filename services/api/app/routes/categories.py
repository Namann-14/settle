from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers import category as category_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    schema: CategoryCreate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Create a custom category for the user.
    """
    with handle_controller_errors():
        return category_controller.create_category(db, current_user, schema)


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    List all system categories and custom categories belonging to current user.
    """
    with handle_controller_errors():
        return category_controller.list_user_categories(db, current_user)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve category details by ID.
    """
    with handle_controller_errors():
        return category_controller.get_category(db, category_id, current_user)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    schema: CategoryUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update a custom category name. System categories cannot be modified.
    """
    with handle_controller_errors():
        return category_controller.update_category(db, category_id, current_user, schema)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Delete a custom category. System categories cannot be deleted.
    """
    with handle_controller_errors():
        category_controller.delete_category(db, category_id, current_user)
        return None
