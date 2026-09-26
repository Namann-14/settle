"""
Server-to-server calls into services/ai for the Telegram bot.

The bot has no Clerk session, so these hit ai's /internal routes with the
shared INTERNAL_API_KEY instead of a user token.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date

import httpx

from app.core.config import settings

_TIMEOUT = httpx.Timeout(45.0)


class AIServiceError(Exception):
    pass


@dataclass
class Extracted:
    amount: float | None
    currency: str | None
    description: str | None
    merchant: str | None
    date: str | None
    category_name: str | None
    confidence: float
    transcript: str | None = None

    @classmethod
    def from_payload(cls, data: dict, transcript: str | None = None) -> "Extracted":
        return cls(
            amount=data.get("amount"),
            currency=data.get("currency"),
            description=data.get("description"),
            merchant=data.get("merchant"),
            date=data.get("date"),
            category_name=data.get("category_name"),
            confidence=float(data.get("confidence") or 0.0),
            transcript=transcript,
        )


def _url(path: str) -> str:
    return f"{settings.AI_SERVICE_URL.rstrip('/')}{settings.AI_ROUTE_PREFIX}{path}"


def _headers() -> dict[str, str]:
    return {"X-Internal-Key": settings.INTERNAL_API_KEY}


def _context(categories: list[str], me_name: str | None, currency: str, today: date) -> dict:
    return {
        "categories": [{"name": name} for name in categories],
        "me_name": me_name,
        "default_currency": currency,
        "today": today.isoformat(),
    }


def extract_text(
    text: str, *, categories: list[str], me_name: str | None, currency: str, today: date
) -> Extracted:
    try:
        res = httpx.post(
            _url("/internal/extract/text"),
            json={"text": text, **_context(categories, me_name, currency, today)},
            headers=_headers(),
            timeout=_TIMEOUT,
        )
        res.raise_for_status()
    except httpx.HTTPError as err:
        raise AIServiceError(str(err)) from err
    return Extracted.from_payload(res.json())


def extract_voice(
    audio: bytes,
    *,
    filename: str,
    mime: str,
    categories: list[str],
    me_name: str | None,
    currency: str,
    today: date,
) -> Extracted:
    try:
        res = httpx.post(
            _url("/internal/extract/voice"),
            files={"file": (filename, audio, mime)},
            data={"context": json.dumps(_context(categories, me_name, currency, today))},
            headers=_headers(),
            timeout=_TIMEOUT,
        )
        res.raise_for_status()
    except httpx.HTTPError as err:
        raise AIServiceError(str(err)) from err
    data = res.json()
    return Extracted.from_payload(data["extracted"], transcript=data.get("transcript"))
