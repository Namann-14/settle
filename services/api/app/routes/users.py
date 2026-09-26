from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers import user as user_controller
from app.controllers import whatsapp as whatsapp_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.whatsapp import LinkCodeResponse

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

@router.post("/me/whatsapp/link-code", response_model=LinkCodeResponse)
def create_whatsapp_link_code(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Issue a short-lived code the user sends to the WhatsApp bot as "LINK <code>".
    """
    with handle_controller_errors():
        return whatsapp_controller.create_link_code(db, current_user)


@router.delete("/me/whatsapp", status_code=status.HTTP_204_NO_CONTENT)
def unlink_whatsapp(
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    Detach the linked WhatsApp number.
    """
    with handle_controller_errors():
        whatsapp_controller.unlink(db, current_user)
