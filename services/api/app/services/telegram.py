"""
Thin client for the Telegram Bot API. Free, no business verification.
"""

from __future__ import annotations

import hmac
import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(15.0)
_API = "https://api.telegram.org"


def is_configured() -> bool:
    return bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_WEBHOOK_SECRET)


def verify_secret(header: str | None, secret: str | None = None) -> bool:
    """Check X-Telegram-Bot-Api-Secret-Token against the secret given to setWebhook."""
    expected = secret if secret is not None else settings.TELEGRAM_WEBHOOK_SECRET
    if not expected or not header:
        return False
    return hmac.compare_digest(header, expected)


def _method_url(method: str) -> str:
    return f"{_API}/bot{settings.TELEGRAM_BOT_TOKEN}/{method}"


def call(method: str, payload: dict) -> dict | None:
    """POST a Bot API method. Failures are logged, never raised: a failed reply
    must not fail the webhook, or Telegram retries the inbound update."""
    try:
        res = httpx.post(_method_url(method), json=payload, timeout=_TIMEOUT)
        body = res.json()
        if not body.get("ok"):
            logger.warning("telegram %s failed: %s", method, str(body)[:500])
            return None
        return body.get("result")
    except (httpx.HTTPError, ValueError) as err:
        logger.warning("telegram %s error: %s", method, err)
        return None


def send_text(chat_id: int, text: str) -> None:
    """Text is HTML (parse_mode=HTML); callers escape user-supplied parts."""
    call(
        "sendMessage",
        {"chat_id": chat_id, "text": text[:4096], "parse_mode": "HTML", "disable_web_page_preview": True},
    )


def send_buttons(chat_id: int, text: str, buttons: list[tuple[str, str]]) -> None:
    """One row of inline buttons as (callback_data, label); callback_data is at most 64 bytes."""
    call(
        "sendMessage",
        {
            "chat_id": chat_id,
            "text": text[:4096],
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [[{"text": label, "callback_data": data} for data, label in buttons]]
            },
        },
    )


def answer_callback(callback_id: str) -> None:
    """Stops the spinner on the tapped button."""
    call("answerCallbackQuery", {"callback_query_id": callback_id})


def edit_text(chat_id: int, message_id: int, text: str) -> None:
    """Replace a message's text and drop its buttons, so a draft can't be tapped twice."""
    call(
        "editMessageText",
        {"chat_id": chat_id, "message_id": message_id, "text": text[:4096], "parse_mode": "HTML"},
    )


def download_file(file_id: str) -> bytes:
    """Resolve a file_id with getFile, then fetch the bytes (bot files are capped at 20MB)."""
    meta = httpx.post(_method_url("getFile"), json={"file_id": file_id}, timeout=_TIMEOUT)
    meta.raise_for_status()
    file_path = meta.json()["result"]["file_path"]
    res = httpx.get(f"{_API}/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path}", timeout=_TIMEOUT)
    res.raise_for_status()
    return res.content
