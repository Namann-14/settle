from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import user as user_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Get current authenticated user profile.
    """
    with handle_controller_errors():
        return user_controller.get_current_user_profile(db, current_user)


@router.patch("/me", response_model=UserResponse)
def update_me(
    schema: UserUpdate,
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Update current authenticated user profile.
    """
    with handle_controller_errors():
        return user_controller.update_profile(db, current_user, schema)