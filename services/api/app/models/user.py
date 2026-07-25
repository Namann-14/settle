from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import UUIDMixin, TimestampMixin


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    clerk_user_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
    )

    name: Mapped[str | None]