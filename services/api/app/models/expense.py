from __future__ import annotations

import uuid
from datetime import date as date_type, datetime
from decimal import Decimal

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin
from app.db.enums import SplitType


class Expense(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "expenses"
    __table_args__ = (
        Index("ix_expenses_group_id_date", "group_id", "date"),
        Index("ix_expenses_paid_by_id", "paid_by_id"),
        Index("ix_expenses_created_by_id", "created_by_id"),
        Index("ix_expenses_group_id", "group_id"),
        Index("ix_expenses_date", "date"),
    )

    description: Mapped[str] = mapped_column(String(500), nullable=False)
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    split_type: Mapped[SplitType] = mapped_column(
        SAEnum(SplitType, name="split_type"), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True, index=True)

    # nullable => personal expense (not tied to a group)
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
    # nullable => not spawned from a recurring template
    recurring_expense_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recurring_expenses.id", ondelete="SET NULL"), nullable=True
    )

    # relationships
    group: Mapped["Group | None"] = relationship(back_populates="expenses")
    category: Mapped["Category | None"] = relationship(back_populates="expenses")
    paid_by: Mapped["User"] = relationship(
        back_populates="expenses_paid", foreign_keys=[paid_by_id]
    )
    created_by: Mapped["User"] = relationship(
        back_populates="expenses_created", foreign_keys=[created_by_id]
    )
    recurring_expense: Mapped["RecurringExpense | None"] = relationship(back_populates="expenses")
    splits: Mapped[list["ExpenseSplit"]] = relationship(
        back_populates="expense", cascade="all, delete-orphan"
    )
    ai_drafts: Mapped[list["AIExpenseDraft"]] = relationship(back_populates="resulting_expense")