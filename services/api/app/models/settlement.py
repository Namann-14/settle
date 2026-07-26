from __future__ import annotations

import uuid
from datetime import date as date_type
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin


class Settlement(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "settlements"
    __table_args__ = (
        CheckConstraint("paid_by_id != received_by_id", name="ck_settlement_distinct_parties"),
        Index("ix_settlements_group_id", "group_id"),
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)

    # nullable => direct friend-to-friend settlement outside any group
    group_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=True
    )
    paid_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    received_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    # relationships
    group: Mapped["Group | None"] = relationship(back_populates="settlements")
    paid_by: Mapped["User"] = relationship(
        back_populates="settlements_paid", foreign_keys=[paid_by_id]
    )
    received_by: Mapped["User"] = relationship(
        back_populates="settlements_received", foreign_keys=[received_by_id]
    )
    created_by: Mapped["User"] = relationship(
        back_populates="settlements_created", foreign_keys=[created_by_id]
    )