from app.controllers.category import (
    create_category,
    delete_category,
    get_category,
    list_user_categories,
    update_category,
)
from app.controllers.expense import (
    create_expense,
    delete_expense,
    get_expense,
    list_user_expenses,
    update_expense,
)
from app.controllers.group import (
    add_member,
    create_group,
    delete_group,
    get_group,
    invite_member,
    list_user_groups,
    update_group,
)
from app.controllers.settlement import (
    create_settlement,
    delete_settlement,
    get_settlement,
    list_user_settlements,
    update_settlement,
)
from app.controllers.user import (
    get_current_user_profile,
    sync_user,
    update_profile,
)


# Domain Exceptions


class ControllerError(Exception):
    """Base exception class for all controller / domain errors."""

    pass


class NotFoundError(ControllerError):
    """Raised when a requested domain entity is not found."""

    pass


class UserNotFoundError(NotFoundError):
    """Raised when a specified user is not found."""

    pass


class ExpenseNotFoundError(NotFoundError):
    """Raised when a specified expense is not found."""

    pass


class GroupNotFoundError(NotFoundError):
    """Raised when a specified group is not found."""

    pass


class SettlementNotFoundError(NotFoundError):
    """Raised when a specified settlement is not found."""

    pass


class CategoryNotFoundError(NotFoundError):
    """Raised when a specified category is not found."""

    pass


class PermissionDeniedError(ControllerError):
    """Raised when an operation violates permission rules."""

    pass


class ValidationError(ControllerError):
    """Raised when domain business rules or input validations fail."""

    pass


class ConflictError(ControllerError):
    """Raised when a resource uniqueness or state conflict occurs."""

    pass


__all__ = [
    # Domain Exceptions
    "ControllerError",
    "NotFoundError",
    "UserNotFoundError",
    "ExpenseNotFoundError",
    "GroupNotFoundError",
    "SettlementNotFoundError",
    "CategoryNotFoundError",
    "PermissionDeniedError",
    "ValidationError",
    "ConflictError",
    # User Controller
    "sync_user",
    "get_current_user_profile",
    "update_profile",
    # Expense Controller
    "create_expense",
    "get_expense",
    "list_user_expenses",
    "update_expense",
    "delete_expense",
    # Group Controller
    "create_group",
    "get_group",
    "list_user_groups",
    "update_group",
    "delete_group",
    "invite_member",
    "add_member",
    # Settlement Controller
    "create_settlement",
    "get_settlement",
    "list_user_settlements",
    "update_settlement",
    "delete_settlement",
    # Category Controller
    "create_category",
    "get_category",
    "list_user_categories",
    "update_category",
    "delete_category",
]
