"""
Thin client for the WhatsApp Cloud API (Meta Graph API).

Every reply the bot sends answers a user's message inside the 24h customer
service window, so none of these calls are billed.
"""

from __future__ import annotations

import hashlib
import hmac
import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(15.0)


def is_configured() -> bool:
    return bool(
        settings.WHATSAPP_ACCESS_TOKEN
        and settings.WHATSAPP_PHONE_NUMBER_ID
        and settings.WHATSAPP_APP_SECRET
    )


def verify_signature(raw_body: bytes, header: str | None, app_secret: str | None = None) -> bool:
    """Check Meta's X-Hub-Signature-256 header: sha256=<hex hmac of the raw body>."""
    secret = app_secret if app_secret is not None else settings.WHATSAPP_APP_SECRET
    if not secret or not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header.removeprefix("sha256="))


def _graph_url(path: str) -> str:
    return f"https://graph.facebook.com/{settings.WHATSAPP_GRAPH_VERSION}/{path.lstrip('/')}"


def _auth_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}


def _send(payload: dict) -> None:
    body = {"messaging_product": "whatsapp", "recipient_type": "individual", **payload}
    try:
        res = httpx.post(
            _graph_url(f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"),
            json=body,
            headers=_auth_headers(),
            timeout=_TIMEOUT,
        )
        if res.status_code >= 400:
            logger.warning("whatsapp send failed: %s %s", res.status_code, res.text[:500])
    except httpx.HTTPError as err:
        # A failed reply must not fail the webhook, or Meta retries the inbound message.
        logger.warning("whatsapp send error: %s", err)


def send_text(to: str, body: str) -> None:
    _send({"to": to, "type": "text", "text": {"preview_url": False, "body": body[:4096]}})


def send_buttons(to: str, body: str, buttons: list[tuple[str, str]]) -> None:
    """Reply buttons: up to 3, titles at most 20 chars, ids at most 256 chars."""
    _send(
        {
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": body[:1024]},
                "action": {
                    "buttons": [
                        {"type": "reply", "reply": {"id": bid, "title": title[:20]}}
                        for bid, title in buttons[:3]
                    ]
                },
            },
        }
    )


def download_media(media_id: str) -> tuple[bytes, str]:
    """Resolve a media id to its short-lived URL, then fetch the bytes."""
    meta = httpx.get(_graph_url(media_id), headers=_auth_headers(), timeout=_TIMEOUT)
    meta.raise_for_status()
    info = meta.json()
    res = httpx.get(info["url"], headers=_auth_headers(), timeout=_TIMEOUT, follow_redirects=True)
    res.raise_for_status()
    return res.content, info.get("mime_type", "audio/ogg")
