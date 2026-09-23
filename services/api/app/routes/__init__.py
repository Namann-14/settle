from contextlib import contextmanager

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.controllers.exceptions import (
    ConflictError,
    ControllerError,
    NotFoundError,
    PermissionDeniedError,
    ValidationError,
)
from app.controllers import group as group_controller
from app.controllers import user as user_controller
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.repositories import user as user_repo
from app.services.clerk import fetch_clerk_profile


@contextmanager
def handle_controller_errors():
    """
    Context manager that catches domain controller exceptions and translates
    them into standard HTTP responses.
    """
    try:
        yield
    except NotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err),
        ) from err
    except PermissionDeniedError as err:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(err),
        ) from err
    except ValidationError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        ) from err
    except ConflictError as err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(err),
        ) from err
    except ControllerError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        ) from err


def get_current_db_user(
    auth_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that resolves the Clerk authenticated user into the local database User model.
    Syncs user record on-the-fly if missing, pulling email and name from Clerk
    the first time so members can be found (and invited) by email.
    """
    clerk_user_id = auth_user["user_id"]
    with handle_controller_errors():
        user = user_repo.get_user_by_clerk_id(db, clerk_user_id)
        if user is not None and user.email:
            return user

        email, name = fetch_clerk_profile(clerk_user_id)
        user = user_controller.sync_user(db, clerk_user_id=clerk_user_id, email=email, name=name)
        group_controller.claim_invitations(db, user)
        return user
