from __future__ import annotations

import httpx

from app.agents.expense_extraction_agent.state import ExpenseExtractionState
from app.chains.extraction import extract_from_receipt_text, extract_from_text
from app.llm.audio import transcribe_audio
from app.llm.vision import get_receipt_ocr_provider

# This graph is a LangGraph-Studio-visible demo of the extraction pipeline —
# the real, auth-wired path is app/routes/expenses.py calling
# app/chains/extraction.py directly with the caller's real categories/members.
# This graph has no RequestContext, so it runs ungrounded (no category list,
# no participant resolution) — useful for inspecting the two-step pipeline in
# Studio, not for production traffic.


async def parse_source(state: ExpenseExtractionState) -> dict:
    """Normalize whatever came in (typed text, a receipt image URL, an audio
    URL) into plain text ready for extraction."""
    source_type = state["source_type"]

    if source_type == "NL_TEXT":
        return {"raw_input": state["raw_input"]}

    if not state.get("file_url"):
        raise ValueError(f"source_type={source_type} requires file_url")

    async with httpx.AsyncClient() as client:
        resp = await client.get(state["file_url"])
        resp.raise_for_status()
        content = resp.content

    if source_type == "VOICE":
        transcript = await transcribe_audio(filename="audio", audio_bytes=content)
        return {"raw_input": transcript}

    if source_type == "RECEIPT_IMAGE":
        provider = get_receipt_ocr_provider()
        ocr_text = await provider.extract_text(content, "image/jpeg")
        return {"raw_input": ocr_text}

    raise ValueError(f"unknown source_type: {source_type}")


async def extract_fields(state: ExpenseExtractionState) -> dict:
    """Run structured extraction on the normalized text. Ungrounded — no
    real category list or group members, since this path has no caller
    context (see module docstring)."""
    source_type = state["source_type"]
    text = state["raw_input"] or ""

    if source_type == "RECEIPT_IMAGE":
        extracted = await extract_from_receipt_text(
            ocr_text=text, categories=[], me_name=None, default_currency="INR"
        )
    else:
        extracted = await extract_from_text(
            text=text, categories=[], me_name=None, default_currency="INR"
        )

    return {
        "parsed_payload": extracted.model_dump(),
        "confidence_score": extracted.confidence,
    }
