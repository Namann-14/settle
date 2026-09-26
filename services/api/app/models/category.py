from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import UUIDMixin


class Category(UUIDMixin, Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("name", "user_id", name="uq_category_name_user"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # lucide icon name ("utensils") and chart color token ("chart-3"), both optional
    icon: Mapped[str | None] = mapped_column(String(32), nullable=True)
    color: Mapped[str | None] = mapped_column(String(16), nullable=True)

    # null user_id => system-wide category (Food, Travel, Rent, ...)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )

    # relationships
    expenses: Mapped[list["Expense"]] = relationship(back_populates="category")
    recurring_expenses: Mapped[list["RecurringExpense"]] = relationship(back_populates="category")
    budgets: Mapped[list["Budget"]] = relationship(back_populates="category", cascade="all, delete-orphan")