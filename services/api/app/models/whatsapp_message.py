from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin


class WhatsAppMessage(UUIDMixin, TimestampMixin, Base):
    """
    One inbound WhatsApp message. The unique wamid makes Meta's webhook
    retries no-ops, and expense_id is what "undo" reverses.
    """

    __tablename__ = "whatsapp_messages"

    wamid: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    from_phone: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    # text | audio | interactive | other
    kind: Mapped[str] = mapped_column(String(16), nullable=False)

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True
    )
    expense_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("expenses.id", ondelete="SET NULL"), nullable=True
    )
    draft_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_expense_drafts.id", ondelete="SET NULL"), nullable=True
    )
