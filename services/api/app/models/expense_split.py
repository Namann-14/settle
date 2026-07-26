from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Index, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import UUIDMixin


class ExpenseSplit(UUIDMixin, Base):
    __tablename__ = "expense_splits"
    __table_args__ = (
        UniqueConstraint("expense_id", "user_id", name="uq_expense_split_user"),
        Index("ix_expense_splits_user_id", "user_id"),
    )

    expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    amount_owed: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    # only for PERCENTAGE splits — source of truth that recomputes amount_owed if expense.amount changes
    percentage: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    # reserved for a future SHARES split type
    share: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)

    # relationships
    expense: Mapped["Expense"] = relationship(back_populates="splits")
    user: Mapped["User"] = relationship(back_populates="splits")