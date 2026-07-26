from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.controllers.user import get_me
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get(
    "/me",
    response_model=UserResponse,   
)
async def me(
    auth_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await get_me(
        auth_user,
        db,
    )