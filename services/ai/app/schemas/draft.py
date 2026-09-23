from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.categorize import CategorySuggestion
from app.schemas.common import SplitType


class FromTextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    group_id: str | None = Field(
        default=None, description="Scopes participant name resolution to this group's members"
    )


class ResolvedParticipant(BaseModel):
    raw_name: str = Field(description="Name exactly as extracted from the input")
    user_id: str | None = Field(default=None, description="Real user UUID, or null if unresolved")
    resolution: Literal["self", "matched", "unresolved", "ambiguous"]
    candidates: list[str] = Field(
        default_factory=list, description="Other member names this could plausibly be, if ambiguous"
    )


class ExpenseDraft(BaseModel):
    """Shared output shape for text/receipt/voice extraction.

    Maps ~1:1 onto services/api's ExpenseCreate minus the bits that need human
    confirmation (unresolved participants, low-confidence category). The ai
    service never creates the expense — the frontend fills any gaps and POSTs
    this to services/api itself.
    """

    source_type: Literal["NL_TEXT", "RECEIPT_IMAGE", "VOICE"]
    amount: float | None = None
    currency: str = "INR"
    description: str
    merchant: str | None = None
    date: str | None = Field(default=None, description="ISO date YYYY-MM-DD, null if unstated")
    category: CategorySuggestion | None = None
    split_type: SplitType = SplitType.EQUAL
    group_id: str | None = None
    paid_by_id: str | None = None
    participants: list[ResolvedParticipant] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    warnings: list[str] = Field(default_factory=list)
    transcript: str | None = Field(default=None, description="Populated for VOICE sources")
    raw_text: str | None = None
