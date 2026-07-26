from __future__ import annotations

import uuid

from sqlalchemy import Enum as SAEnum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin
from app.db.enums import AIDraftStatus, AISourceType


class AIExpenseDraft(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "ai_expense_drafts"

    source_type: Mapped[AISourceType] = mapped_column(
        SAEnum(AISourceType, name="ai_source_type"), nullable=False
    )
    raw_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    # only for RECEIPT_IMAGE — reference to blob storage, not the file itself
    file_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    # freeform AI output (description, amount, category, suggested split, ...) —
    # kept as JSONB so prompt/model changes don't require a migration
    parsed_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[AIDraftStatus] = mapped_column(
        SAEnum(AIDraftStatus, name="ai_draft_status"), default=AIDraftStatus.PENDING, nullable=False
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # nullable until the user confirms and a real Expense is created
    resulting_expense_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("expenses.id", ondelete="SET NULL"), nullable=True
    )

    # relationships
    user: Mapped["User"] = relationship(back_populates="ai_drafts")
    resulting_expense: Mapped["Expense | None"] = relationship(back_populates="ai_drafts")