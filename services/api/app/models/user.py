from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    clerk_user_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    default_currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)

    # relationships
    memberships: Mapped[list["GroupMember"]] = relationship(back_populates="user")
    created_groups: Mapped[list["Group"]] = relationship(
        back_populates="created_by", foreign_keys="Group.created_by_id"
    )
    expenses_paid: Mapped[list["Expense"]] = relationship(
        back_populates="paid_by", foreign_keys="Expense.paid_by_id"
    )
    expenses_created: Mapped[list["Expense"]] = relationship(
        back_populates="created_by", foreign_keys="Expense.created_by_id"
    )
    splits: Mapped[list["ExpenseSplit"]] = relationship(back_populates="user")
    settlements_paid: Mapped[list["Settlement"]] = relationship(
        back_populates="paid_by", foreign_keys="Settlement.paid_by_id"
    )
    settlements_received: Mapped[list["Settlement"]] = relationship(
        back_populates="received_by", foreign_keys="Settlement.received_by_id"
    )
    settlements_created: Mapped[list["Settlement"]] = relationship(
        back_populates="created_by", foreign_keys="Settlement.created_by_id"
    )
    sent_invitations: Mapped[list["GroupInvitation"]] = relationship(
        back_populates="invited_by", foreign_keys="GroupInvitation.invited_by_id"
    )
    received_invitations: Mapped[list["GroupInvitation"]] = relationship(
        back_populates="invited_user", foreign_keys="GroupInvitation.invited_user_id"
    )
    ai_drafts: Mapped[list["AIExpenseDraft"]] = relationship(back_populates="user")
    chat_conversations: Mapped[list["ChatConversation"]] = relationship(back_populates="user")
    recurring_expenses_created: Mapped[list["RecurringExpense"]] = relationship(
        back_populates="created_by", foreign_keys="RecurringExpense.created_by_id"
    )
    recurring_expenses_paid: Mapped[list["RecurringExpense"]] = relationship(
        back_populates="paid_by", foreign_keys="RecurringExpense.paid_by_id"
    )