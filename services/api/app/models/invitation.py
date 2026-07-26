from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDMixin
from app.db.enums import InvitationStatus


class GroupInvitation(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "group_invitations"
    __table_args__ = (
        # only one PENDING invite per (group, email) at a time — re-invite allowed after cancel/expire
        Index(
            "uq_group_invitation_pending_email",
            "group_id", "email",
            unique=True,
            postgresql_where=text("status = 'PENDING'"),
        ),
    )

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[InvitationStatus] = mapped_column(
        SAEnum(InvitationStatus, name="invitation_status"),
        default=InvitationStatus.PENDING, nullable=False,
    )

    group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False
    )
    invited_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    # nullable => invitee doesn't have an account yet
    invited_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # relationships
    group: Mapped["Group"] = relationship(back_populates="invitations")
    invited_by: Mapped["User"] = relationship(
        back_populates="sent_invitations", foreign_keys=[invited_by_id]
    )
    invited_user: Mapped["User | None"] = relationship(
        back_populates="received_invitations", foreign_keys=[invited_user_id]
    )