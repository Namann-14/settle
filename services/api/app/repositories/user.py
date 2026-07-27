from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    stmt = select(User).where(User.id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_clerk_id(db: Session, clerk_user_id: str) -> User | None:
    stmt = select(User).where(User.clerk_user_id == clerk_user_id)
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def get_users_by_ids(db: Session, user_ids: list[UUID]) -> list[User]:
    if not user_ids:
        return []
    stmt = select(User).where(User.id.in_(user_ids))
    return list(db.execute(stmt).scalars().all())


def create_user(db: Session, schema: UserCreate) -> User:
    user = User(
        clerk_user_id=schema.clerk_user_id,
        email=schema.email,
        name=schema.name,
        default_currency=schema.default_currency,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, schema: UserUpdate) -> User:
    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> bool:
    db.delete(user)
    db.commit()
    return True
