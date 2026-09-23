from __future__ import annotations

from app.chains.extraction import ExtractedExpense
from app.schemas.categorize import CategorySuggestion
from app.schemas.common import SourceType
from app.schemas.draft import ExpenseDraft, ResolvedParticipant
from app.services.participants import resolve_participants


def _map_category(category_name: str | None, categories: list[dict]) -> CategorySuggestion | None:
    if not category_name:
        return None
    match = next((c for c in categories if c["name"].lower() == category_name.lower()), None)
    if match is None:
        return CategorySuggestion(category_id=None, category_name=category_name, confidence=0.3)
    return CategorySuggestion(category_id=str(match["id"]), category_name=match["name"], confidence=0.9)


def build_expense_draft(
    extracted: ExtractedExpense,
    *,
    source_type: SourceType,
    me_user_id: str,
    me_name: str | None = None,
    categories: list[dict],
    members: list[dict] | None,
    group_id: str | None,
    transcript: str | None = None,
    raw_text: str | None = None,
) -> ExpenseDraft:
    """Turn an LLM extraction into the API-facing ExpenseDraft.

    Never creates an expense — the frontend fills any remaining gaps
    (unresolved participants, an off-list category) and POSTs to
    services/api itself.
    """
    warnings: list[str] = []

    participants: list[ResolvedParticipant] = resolve_participants(
        extracted.participants, members or [], me_user_id=me_user_id, me_name=me_name
    )
    for p in participants:
        if p.resolution == "unresolved":
            warnings.append(f"Could not match '{p.raw_name}' to a group member.")
        elif p.resolution == "ambiguous":
            warnings.append(f"'{p.raw_name}' matches multiple members: {', '.join(p.candidates)}.")

    paid_by_id = me_user_id if extracted.payer_is_me else None
    if not extracted.payer_is_me:
        warnings.append("Payer doesn't appear to be you — please confirm who paid.")

    if extracted.amount is None:
        warnings.append("Could not determine the amount — please fill it in.")

    if extracted.notes_for_user:
        warnings.append(extracted.notes_for_user)

    return ExpenseDraft(
        source_type=source_type.value,
        amount=extracted.amount,
        currency=extracted.currency,
        description=extracted.description,
        merchant=extracted.merchant,
        date=extracted.date,
        category=_map_category(extracted.category_name, categories),
        split_type=extracted.split_type,
        group_id=group_id,
        paid_by_id=paid_by_id,
        participants=participants,
        confidence=extracted.confidence,
        warnings=warnings,
        transcript=transcript,
        raw_text=raw_text,
    )
