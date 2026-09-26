"""
Server-to-server extraction for services/api (the WhatsApp bot).

The bot has no Clerk session, so these routes skip build_request_context:
services/api already knows the user and sends their categories, name and
currency in the request. The shared INTERNAL_API_KEY is the trust boundary.
"""

from __future__ import annotations

import hmac
import json
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile, status
from pydantic import BaseModel, Field, ValidationError

from app.chains.extraction import ExtractedExpense, extract_from_text
from app.core.config import settings
from app.llm.audio import transcribe_audio


def require_internal_key(x_internal_key: Annotated[str | None, Header()] = None) -> None:
    # An unset key locks the routes rather than opening them.
    expected = settings.internal_api_key
    if not expected or not x_internal_key or not hmac.compare_digest(x_internal_key, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid internal key")


router = APIRouter(prefix="/internal", tags=["internal"], dependencies=[Depends(require_internal_key)])


class ExtractionContext(BaseModel):
    categories: list[dict] = Field(default_factory=list)
    me_name: str | None = None
    default_currency: str = "INR"
    today: date | None = None


class ExtractTextRequest(ExtractionContext):
    text: str = Field(min_length=1, max_length=2000)


class ExtractVoiceResponse(BaseModel):
    transcript: str
    extracted: ExtractedExpense


@router.post("/extract/text", response_model=ExtractedExpense)
async def extract_text(body: ExtractTextRequest):
    return await extract_from_text(
        text=body.text,
        categories=body.categories,
        me_name=body.me_name,
        default_currency=body.default_currency,
        today=body.today,
    )


@router.post("/extract/voice", response_model=ExtractVoiceResponse)
async def extract_voice(file: UploadFile = File(...), context: str = Form("{}")):
    try:
        ctx = ExtractionContext.model_validate(json.loads(context))
    except (ValueError, ValidationError) as err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Bad context") from err

    # Bias transcription toward the user's category names.
    prompt = ", ".join(c["name"] for c in ctx.categories if c.get("name"))
    transcript = await transcribe_audio(
        filename=file.filename or "voice.ogg",
        audio_bytes=await file.read(),
        prompt=prompt or None,
    )
    transcript = (transcript or "").strip()
    if not transcript:
        # silence or noise: let the caller answer "couldn't find an amount"
        return ExtractVoiceResponse(transcript="", extracted=ExtractedExpense(description="", confidence=0.0))
    extracted = await extract_from_text(
        text=transcript,
        categories=ctx.categories,
        me_name=ctx.me_name,
        default_currency=ctx.default_currency,
        today=ctx.today,
    )
    return ExtractVoiceResponse(transcript=transcript, extracted=extracted)
