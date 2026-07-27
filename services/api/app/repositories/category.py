from uuid import UUID
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_category_by_id(db: Session, category_id: UUID) -> Category | None:
    stmt = select(Category).where(Category.id == category_id)
    return db.execute(stmt).scalar_one_or_none()


def get_categories_for_user(db: Session, user_id: UUID) -> list[Category]:
    """
    Returns global system categories (user_id is None) and user-specific custom categories.
    """
    stmt = select(Category).where(
        or_(Category.user_id.is_(None), Category.user_id == user_id)
    ).order_by(Category.is_system.desc(), Category.name.asc())
    return list(db.execute(stmt).scalars().all())


def create_category(db: Session, schema: CategoryCreate) -> Category:
    category = Category(
        name=schema.name,
        is_system=schema.is_system,
        user_id=schema.user_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category: Category, schema: CategoryUpdate) -> Category:
    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> bool:
    db.delete(category)
    db.commit()
    return True
