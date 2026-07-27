from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers import (
    CategoryNotFoundError,
    ConflictError,
    PermissionDeniedError,
    ValidationError,
)
from app.models.category import Category
from app.models.user import User

from app.repositories import category as category_repo
from app.schemas.category import CategoryCreate, CategoryUpdate


def create_category(
    db: Session,
    current_user: User,
    schema: CategoryCreate,
) -> Category:
    """
    Creates a new custom category for the user.
    Enforces uniqueness of category names per user.
    """
    # Enforce category belongs to the authenticated user and is not system
    schema.user_id = current_user.id
    schema.is_system = False

    # Check uniqueness of name for this user (case-insensitive)
    existing_categories = category_repo.get_categories_for_user(db, current_user.id)
    if any(c.name.lower() == schema.name.lower() for c in existing_categories):
        raise ConflictError(f"Category with name '{schema.name}' already exists")

    return category_repo.create_category(db, schema)


def get_category(
    db: Session,
    category_id: UUID,
    current_user: User,
) -> Category:
    """
    Retrieves a category by ID if it is a system category or belongs to current_user.
    """
    category = category_repo.get_category_by_id(db, category_id)
    if not category:
        raise CategoryNotFoundError("Category not found")

    if not category.is_system and category.user_id != current_user.id:
        raise PermissionDeniedError("Access to category denied")

    return category


def list_user_categories(
    db: Session,
    current_user: User,
) -> list[Category]:
    """
    Lists system categories and custom categories belonging to current_user.
    """
    return category_repo.get_categories_for_user(db, current_user.id)


def update_category(
    db: Session,
    category_id: UUID,
    current_user: User,
    schema: CategoryUpdate,
) -> Category:
    """
    Updates a user category name. System categories cannot be updated.
    """
    category = category_repo.get_category_by_id(db, category_id)
    if not category:
        raise CategoryNotFoundError("Category not found")

    if category.is_system:
        raise PermissionDeniedError("System categories cannot be modified")

    if category.user_id != current_user.id:
        raise PermissionDeniedError("Access to category denied")

    if schema.name is not None and schema.name.lower() != category.name.lower():
        existing_categories = category_repo.get_categories_for_user(db, current_user.id)
        if any(c.name.lower() == schema.name.lower() for c in existing_categories if c.id != category_id):
            raise ConflictError(f"Category with name '{schema.name}' already exists")

    return category_repo.update_category(db, category, schema)


def delete_category(
    db: Session,
    category_id: UUID,
    current_user: User,
) -> bool:
    """
    Deletes a user custom category. System categories cannot be deleted.
    """
    category = category_repo.get_category_by_id(db, category_id)
    if not category:
        raise CategoryNotFoundError("Category not found")

    if category.is_system:
        raise PermissionDeniedError("System categories cannot be deleted")

    if category.user_id != current_user.id:
        raise PermissionDeniedError("Access to category denied")

    return category_repo.delete_category(db, category)
