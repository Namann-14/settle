from __future__ import annotations

from typing import Protocol

import httpx

from app.core.config import settings
from app.core.errors import CapabilityUnavailable, OcrError

# OCR.Space's free tier caps uploads at 1MB — reject early with a clear error
# rather than let the provider's own (less specific) rejection surface.
_OCR_SPACE_MAX_BYTES = 1024 * 1024
_OCR_SPACE_URL = "https://api.ocr.space/parse/image"


class ReceiptOCRProvider(Protocol):
    async def extract_text(self, image_bytes: bytes, mime_type: str) -> str: ...


class UnavailableReceiptOCR:
    """Default provider: raises with a clear, actionable error.

    Groq's account this service runs against has no vision-capable model
    (verified live: llama-3.3-70b, llama-3.1-8b, gpt-oss, qwen, whisper only —
    no multimodal model). Everything downstream of extract_text (receipt text
    -> ExpenseDraft, in app/chains/extraction.py) is fully built and testable
    against a pasted receipt string, so wiring in a real provider later is a
    config change here, not a feature build.
    """

    async def extract_text(self, image_bytes: bytes, mime_type: str) -> str:
        raise CapabilityUnavailable(
            capability="receipt_ocr",
            reason=(
                "No vision-capable model is configured. The Groq account backing this "
                "service has no multimodal model available."
            ),
            remedy=(
                "Set VISION_PROVIDER to a supported provider and its API key in .env "
                "once one is wired up, or enable a Groq vision model when available."
            ),
        )


class OCRSpaceProvider:
    """OCR.Space's hosted free-tier OCR API (ocr.space/ocrapi).

    Zero self-hosting — just an API key. 25,000 requests/month free, 1MB file
    limit. Returns raw text only (no layout/structure); that's fine here
    since app/chains/extraction.py already expects raw OCR text and turns it
    into an ExpenseDraft.
    """

    async def extract_text(self, image_bytes: bytes, mime_type: str) -> str:
        if len(image_bytes) > _OCR_SPACE_MAX_BYTES:
            raise OcrError(
                f"Image is {len(image_bytes) / 1024:.0f}KB, over OCR.Space's 1MB free-tier "
                "limit. Compress the image before uploading."
            )

        filename = "receipt.jpg" if "jpeg" in mime_type or "jpg" in mime_type else "receipt.png"
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    _OCR_SPACE_URL,
                    data={
                        "apikey": settings.ocr_space_api_key,
                        "language": settings.ocr_space_language,
                        "OCREngine": "2",
                        "scale": "true",
                        "isOverlayRequired": "false",
                    },
                    files={"file": (filename, image_bytes, mime_type)},
                )
        except httpx.RequestError as err:
            raise OcrError(f"cannot reach OCR.Space: {err}") from err

        if resp.status_code >= 400:
            raise OcrError(f"OCR.Space returned {resp.status_code}: {resp.text[:300]}")

        body = resp.json()
        if body.get("IsErroredOnProcessing"):
            error_msg = body.get("ErrorMessage") or body.get("ErrorDetails") or "unknown error"
            if isinstance(error_msg, list):
                error_msg = "; ".join(error_msg)
            raise OcrError(f"OCR.Space failed to process the image: {error_msg}")

        parsed_results = body.get("ParsedResults") or []
        text = "\n".join(r.get("ParsedText", "") for r in parsed_results).strip()
        if not text:
            raise OcrError("OCR.Space returned no text for this image.")
        return text


def get_receipt_ocr_provider() -> ReceiptOCRProvider:
    if settings.vision_provider == "none":
        return UnavailableReceiptOCR()
    if settings.vision_provider == "ocrspace":
        if not settings.ocr_space_api_key:
            raise CapabilityUnavailable(
                capability="receipt_ocr",
                reason="VISION_PROVIDER=ocrspace but OCR_SPACE_API_KEY is not set.",
                remedy="Add OCR_SPACE_API_KEY to .env.",
            )
        return OCRSpaceProvider()
    raise CapabilityUnavailable(
        capability="receipt_ocr",
        reason=f"Unknown VISION_PROVIDER '{settings.vision_provider}'.",
        remedy="Set VISION_PROVIDER=none or ocrspace, or implement a provider and register it here.",
    )
