from __future__ import annotations


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
