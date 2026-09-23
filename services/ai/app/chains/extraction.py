from __future__ import annotations

from datetime import date as date_cls

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.llm.client import get_extraction_model
from app.prompts.extraction import EXTRACTION_SYSTEM, RECEIPT_EXTRACTION_SYSTEM
from app.schemas.common import SplitType


class ParticipantMention(BaseModel):
    """A person mentioned in the input, as the model saw them — not yet
    resolved to a real user_id. That resolution happens in
    app.services.participants, against real group member data."""

    raw_name: str = Field(description="Name exactly as written, e.g. 'Aman', or 'me'/'I' for the speaker")
    share_amount: float | None = None
    share_percentage: float | None = None


class ExtractedExpense(BaseModel):
    """Structured draft extracted from natural-language expense text
    (typed, transcribed, or OCR'd receipt text — same shape for all three)."""

    amount: float | None = Field(default=None, description="Total amount, positive")
    currency: str = Field(default="INR", description="ISO 4217 code")
    description: str = Field(description="Short human description, e.g. 'lunch'")
    merchant: str | None = None
    date: str | None = Field(default=None, description="ISO date YYYY-MM-DD, null if unstated")
    category_name: str | None = Field(
        default=None, description="Must be chosen from the provided category list, else null"
    )
    split_type: SplitType = SplitType.EQUAL
    participants: list[ParticipantMention] = Field(default_factory=list)
    payer_is_me: bool = True
    confidence: float = Field(ge=0.0, le=1.0)
    notes_for_user: str | None = Field(
        default=None, description="Anything ambiguous the UI should ask about"
    )


def _build_chain(system_prompt: str):
    model = get_extraction_model()
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{text}")])
    return prompt | model.with_structured_output(ExtractedExpense)


_text_chain = None
_receipt_chain = None


def _get_text_chain():
    global _text_chain
    if _text_chain is None:
        _text_chain = _build_chain(EXTRACTION_SYSTEM)
    return _text_chain


def _get_receipt_chain():
    global _receipt_chain
    if _receipt_chain is None:
        _receipt_chain = _build_chain(RECEIPT_EXTRACTION_SYSTEM)
    return _receipt_chain


def _fallback_draft(text: str) -> ExtractedExpense:
    return ExtractedExpense(
        amount=None,
        description=text[:200],
        confidence=0.0,
        notes_for_user="Could not parse this automatically — please fill in the details manually.",
    )


async def _invoke_with_retry(chain, payload: dict, fallback_text: str) -> ExtractedExpense:
    """Retry once, then fall back to a low-confidence manual-entry draft.

    llama-3.3-70b occasionally emits a numeric field as a JSON string, which
    Groq's server-side schema validation rejects outright (observed live, not
    hypothetical) — a repeat attempt usually succeeds. Never 500 the caller
    just because one LLM call produced malformed output.
    """
    try:
        return await chain.ainvoke(payload)
    except Exception:
        try:
            return await chain.ainvoke(payload)
        except Exception:
            return _fallback_draft(fallback_text)


def _ensure_speaker_present(draft: ExtractedExpense) -> ExtractedExpense:
    """Defensive net for the #1 failure mode observed in testing: the model
    hears "split with Aman and Rahul" and lists only Aman and Rahul, silently
    dropping the speaker and turning a 3-way split into a 2-way one. The
    prompt already tells it not to — this is the guarantee, not a suggestion.
    """
    if not draft.payer_is_me:
        return draft
    self_markers = {"i", "me", "myself"}
    has_self = any(p.raw_name.strip().lower() in self_markers for p in draft.participants)
    if has_self or not draft.participants:
        return draft
    draft.participants.insert(0, ParticipantMention(raw_name="me"))
    return draft


async def extract_from_text(
    *,
    text: str,
    categories: list[dict],
    me_name: str | None,
    default_currency: str,
    today: date_cls | None = None,
) -> ExtractedExpense:
    names = ", ".join(c["name"] for c in categories) or "(no categories exist yet)"
    chain = _get_text_chain()
    payload = {
        "text": text,
        "categories": names,
        "me": me_name or "the user",
        "default_currency": default_currency,
        "today": (today or date_cls.today()).isoformat(),
    }
    draft = await _invoke_with_retry(chain, payload, text)
    return _ensure_speaker_present(draft)


async def extract_from_receipt_text(
    *,
    ocr_text: str,
    categories: list[dict],
    me_name: str | None,
    default_currency: str,
    today: date_cls | None = None,
) -> ExtractedExpense:
    names = ", ".join(c["name"] for c in categories) or "(no categories exist yet)"
    chain = _get_receipt_chain()
    payload = {
        "text": ocr_text,
        "categories": names,
        "me": me_name or "the user",
        "default_currency": default_currency,
        "today": (today or date_cls.today()).isoformat(),
    }
    draft = await _invoke_with_retry(chain, payload, ocr_text)
    return _ensure_speaker_present(draft)
