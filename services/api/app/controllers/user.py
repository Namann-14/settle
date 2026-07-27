from __future__ import annotations

from sqlalchemy.orm import Session

from app.controllers import ConflictError, UserNotFoundError
from app.models.user import User

from app.repositories import user as user_repo
from app.schemas.user import UserCreate, UserUpdate


def sync_user(
    db: Session,
    clerk_user_id: str,
    email: str | None = None,
    name: str | None = None,
    default_currency: str = "INR",
) -> User:
    """
    Syncs a Clerk user into the local database.
    - Creates user if they do not exist locally.
    - Otherwise returns existing user without overwriting email with None.
    """
    user = user_repo.get_user_by_clerk_id(db, clerk_user_id)
    if not user:
        create_schema = UserCreate(
            clerk_user_id=clerk_user_id,
            email=email,
            name=name,
            default_currency=default_currency,
        )
        return user_repo.create_user(db, create_schema)

    # Update fields if provided, protecting existing email from being overwritten by None
    update_data: dict[str, str | None] = {}
    if email is not None and email != user.email:
        update_data["email"] = email
    if name is not None and name != user.name:
        update_data["name"] = name

    if update_data:
        update_schema = UserUpdate(**update_data)
        user = user_repo.update_user(db, user, update_schema)

    return user


def get_current_user_profile(db: Session, current_user: User) -> User:
    """
    Returns the authenticated user's profile.
    """
    if not current_user:
        raise UserNotFoundError("Authenticated user profile not found")
    return current_user


def update_profile(db: Session, current_user: User, schema: UserUpdate) -> User:
    """
    Updates the authenticated user's profile.
    Ensures email uniqueness if email is modified.
    """
    if schema.email is not None and schema.email != current_user.email:
        existing_user = user_repo.get_user_by_email(db, schema.email)
        if existing_user and existing_user.id != current_user.id:
            raise ConflictError("User with this email already exists")

    return user_repo.update_user(db, current_user, schema)