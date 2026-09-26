from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Index, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin


class Budget(UUIDMixin, TimestampMixin, Base):
    """A standing monthly spending limit — overall (no category) or per category."""

    __tablename__ = "budgets"
    __table_args__ = (
        # One budget per (user, category), and one overall budget per user.
        # Two partial indexes because NULL category_ids never collide in a plain unique index.
        Index(
            "uq_budget_user_category",
            "user_id",
            "category_id",
            unique=True,
            postgresql_where=text("category_id IS NOT NULL"),
        ),
        Index(
            "uq_budget_user_overall",
            "user_id",
            unique=True,
            postgresql_where=text("category_id IS NULL"),
        ),
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # null => overall monthly budget
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=True
    )

    # relationships
    category: Mapped["Category | None"] = relationship(back_populates="budgets")
