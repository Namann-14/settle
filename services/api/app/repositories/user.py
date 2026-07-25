from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_clerk_id(db: Session, clerk_user_id: str) :
    return (
        db.query(User)
        .filter(User.clerk_user_id == clerk_user_id)
        .one_or_none()
    )

def create_user(db: Session, clerk_user_id: str, email: str, name: str = None) -> User:
    user = User(clerk_user_id = clerk_user_id, email=email, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
