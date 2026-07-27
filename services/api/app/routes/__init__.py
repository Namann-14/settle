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
from app.controllers import user as user_controller
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User


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
    Syncs user record on-the-fly if missing.
    """
    with handle_controller_errors():
        return user_controller.sync_user(db, clerk_user_id=auth_user["user_id"])
