from __future__ import annotations

import uuid

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin
from app.db.enums import ChatRole


class ChatConversation(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "chat_conversations"

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # relationships
    user: Mapped["User"] = relationship(back_populates="chat_conversations")
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )


class ChatMessage(UUIDMixin, Base):
    __tablename__ = "chat_messages"

    role: Mapped[ChatRole] = mapped_column(SAEnum(ChatRole, name="chat_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # tool-call info, or which expense/group IDs the answer referenced
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False
    )

    # relationships
    conversation: Mapped["ChatConversation"] = relationship(back_populates="messages")