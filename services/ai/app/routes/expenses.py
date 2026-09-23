from __future__ import annotations

from fastapi import APIRouter, File, Form, UploadFile

from app.chains.categorize import categorize_expense
from app.chains.extraction import extract_from_receipt_text, extract_from_text
from app.llm.audio import transcribe_audio
from app.llm.vision import get_receipt_ocr_provider
from app.routes.deps import BearerToken
from app.schemas.categorize import CategorizeRequest, CategorizeResponse, CategorySuggestion
from app.schemas.common import SourceType
from app.schemas.draft import ExpenseDraft, FromTextRequest
from app.services.context import build_request_context
from app.services.draft_builder import build_expense_draft

router = APIRouter(prefix="/expenses", tags=["expenses"])


def _map_suggestion(guess, categories: list[dict]) -> CategorySuggestion:
    if guess.category_name is None:
        return CategorySuggestion(category_id=None, category_name="Uncategorized", confidence=guess.confidence)
    match = next((c for c in categories if c["name"].lower() == guess.category_name.lower()), None)
    return CategorySuggestion(
        category_id=str(match["id"]) if match else None,
        category_name=guess.category_name,
        confidence=guess.confidence,
        reasoning=guess.reasoning,
    )


@router.post("/categorize", response_model=CategorizeResponse)
async def categorize(body: CategorizeRequest, token: BearerToken):
    """Suggest an expense category, grounded on the user's real categories."""
    ctx = await build_request_context(token)
    categories = await ctx.client().list_categories()
    guess = await categorize_expense(
        description=body.description,
        amount=body.amount,
        merchant=body.merchant,
        categories=categories,
    )
    return CategorizeResponse(suggestion=_map_suggestion(guess, categories))


@router.post("/from-text", response_model=ExpenseDraft)
async def from_text(body: FromTextRequest, token: BearerToken):
    """Turn a natural-language sentence into a draft expense.

    This never creates an expense — the frontend confirms/edits the draft and
    POSTs it to services/api itself.
    """
    ctx = await build_request_context(token)
    client = ctx.client()
    categories = await client.list_categories()
    members: list[dict] = []
    if body.group_id:
        group = await client.get_group(body.group_id)
        members = group.get("members", [])

    extracted = await extract_from_text(
        text=body.text,
        categories=categories,
        me_name=ctx.user_name,
        default_currency=ctx.default_currency,
    )
    return build_expense_draft(
        extracted,
        source_type=SourceType.NL_TEXT,
        me_user_id=ctx.user_id,
        me_name=ctx.user_name,
        categories=categories,
        members=members,
        group_id=body.group_id,
        raw_text=body.text,
    )


@router.post("/from-receipt", response_model=ExpenseDraft)
async def from_receipt(
    token: BearerToken,
    file: UploadFile = File(...),
    group_id: str | None = Form(default=None),
):
    """Turn a receipt image into a draft expense.

    Currently unavailable: the Groq account backing this service has no
    vision-capable model. Raises a 501 with `{capability, reason, remedy}`
    until a vision provider is configured (see app/llm/vision.py) — the
    receipt-text -> draft half of this pipeline is fully built and tested,
    so enabling this later is a config change, not a feature build.
    """
    ctx = await build_request_context(token)
    image_bytes = await file.read()
    provider = get_receipt_ocr_provider()
    ocr_text = await provider.extract_text(image_bytes, file.content_type or "image/jpeg")

    client = ctx.client()
    categories = await client.list_categories()
    members: list[dict] = []
    if group_id:
        group = await client.get_group(group_id)
        members = group.get("members", [])

    extracted = await extract_from_receipt_text(
        ocr_text=ocr_text,
        categories=categories,
        me_name=ctx.user_name,
        default_currency=ctx.default_currency,
    )
    return build_expense_draft(
        extracted,
        source_type=SourceType.RECEIPT_IMAGE,
        me_user_id=ctx.user_id,
        me_name=ctx.user_name,
        categories=categories,
        members=members,
        group_id=group_id,
        raw_text=ocr_text,
    )


@router.post("/from-voice", response_model=ExpenseDraft)
async def from_voice(
    token: BearerToken,
    file: UploadFile = File(...),
    language: str | None = Form(default=None),
    group_id: str | None = Form(default=None),
):
    """Turn a voice recording into a draft expense: Whisper transcription,
    then the same extraction path as /from-text."""
    ctx = await build_request_context(token)
    audio_bytes = await file.read()

    client = ctx.client()
    categories = await client.list_categories()
    members: list[dict] = []
    if group_id:
        group = await client.get_group(group_id)
        members = group.get("members", [])

    # Bias transcription toward domain vocabulary (category/member names).
    whisper_prompt = ", ".join(
        [c["name"] for c in categories] + [m.get("user_name") or "" for m in members]
    ).strip(", ")

    transcript = await transcribe_audio(
        filename=file.filename or "audio",
        audio_bytes=audio_bytes,
        language=language,
        prompt=whisper_prompt or None,
    )

    extracted = await extract_from_text(
        text=transcript,
        categories=categories,
        me_name=ctx.user_name,
        default_currency=ctx.default_currency,
    )
    return build_expense_draft(
        extracted,
        source_type=SourceType.VOICE,
        me_user_id=ctx.user_id,
        me_name=ctx.user_name,
        categories=categories,
        members=members,
        group_id=group_id,
        transcript=transcript,
    )
