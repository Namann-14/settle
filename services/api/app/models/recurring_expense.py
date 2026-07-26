from __future__ import annotations

import uuid
from datetime import date as date_type
from decimal import Decimal

from sqlalchemy import Boolean, Date, Enum as SAEnum, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin
from app.db.enums import Frequency, SplitType


class RecurringExpense(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "recurring_expenses"

    description: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    split_type: Mapped[SplitType] = mapped_column(
        SAEnum(SplitType, name="split_type"), nullable=False
    )
    frequency: Mapped[Frequency] = mapped_column(
        SAEnum(Frequency, name="frequency"), nullable=False
    )
    interval: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    start_date: Mapped[date_type] = mapped_column(Date, nullable=False)
    end_date: Mapped[date_type | None] = mapped_column(Date, nullable=True)
    next_run_date: Mapped[date_type] = mapped_column(Date, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    group_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    paid_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    # relationships
    group: Mapped["Group | None"] = relationship(back_populates="recurring_expenses")
    category: Mapped["Category | None"] = relationship(back_populates="recurring_expenses")
    paid_by: Mapped["User"] = relationship(
        back_populates="recurring_expenses_paid", foreign_keys=[paid_by_id]
    )
    created_by: Mapped["User"] = relationship(
        back_populates="recurring_expenses_created", foreign_keys=[created_by_id]
    )
    splits: Mapped[list["RecurringExpenseSplit"]] = relationship(
        back_populates="recurring_expense", cascade="all, delete-orphan"
    )
    expenses: Mapped[list["Expense"]] = relationship(back_populates="recurring_expense")


class RecurringExpenseSplit(UUIDMixin, Base):
    __tablename__ = "recurring_expense_splits"
    __table_args__ = (
        UniqueConstraint("recurring_expense_id", "user_id", name="uq_recurring_split_user"),
    )

    amount_owed: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    percentage: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    share: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)

    recurring_expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recurring_expenses.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    # relationships
    recurring_expense: Mapped["RecurringExpense"] = relationship(back_populates="splits")