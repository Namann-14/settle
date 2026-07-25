from sqlalchemy.orm import Session

from app.repositories.user import (
    get_user_by_clerk_id,
    create_user,
)
from app.services.clerk import get_clerk_user


async def get_me(
    auth_user: dict,
    db: Session,
):
    user = get_user_by_clerk_id(
        db,
        auth_user["user_id"],
    )

    if user:
        return user

    clerk_user = await get_clerk_user(
        auth_user["user_id"]
    )

    email = (
        clerk_user.email_addresses[0].email_address
        if clerk_user.email_addresses
        else None
    )

    name = clerk_user.first_name

    return create_user(
        db,
        clerk_user_id=auth_user["user_id"],
        email=email,
        name=name,
    )