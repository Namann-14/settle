"""
Telegram bot: turns inbound messages into personal expenses.

Flow per update: dedupe on update_id, resolve the chat to a user (or run the
/start <code> link handshake), then either answer a command or extract an
expense. Confident extractions save straight away; shaky ones become a pending
AIExpenseDraft behind Save / Cancel buttons.
"""

from __future__ import annotations

import logging
import re
import secrets
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
from html import escape
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.controllers import expense as expense_controller
from app.controllers import spending as spending_controller
from app.controllers.exceptions import ConflictError, ControllerError
from app.core.config import settings
from app.db.enums import AIDraftStatus, AISourceType, SplitType
from app.models.category import Category
from app.models.user import User
from app.repositories import category as category_repo
from app.repositories import spending as spending_repo
from app.repositories import telegram as telegram_repo
from app.schemas.expense import ExpenseCreate
from app.schemas.telegram import InboundUpdate, LinkCodeResponse
from app.services import ai_client
from app.services import telegram as tg

logger = logging.getLogger(__name__)

AUTO_SAVE_CONFIDENCE = 0.75
LINK_CODE_TTL = timedelta(minutes=15)
# no 0/O, 1/I/L: codes get typed by hand sometimes
LINK_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
LINK_CODE_LENGTH = 8
# "/start CODE" from the deep link, or "/link CODE" / "link CODE" typed by hand
LINK_RE = re.compile(r"^\s*/?(?:start|link)(?:@\w+)?\s+([A-Za-z0-9]{4,16})\s*$", re.IGNORECASE)

COMMANDS = {"help", "undo", "today", "month"}
COMMAND_ALIASES = {"start": "help", "hi": "help", "hello": "help", "menu": "help", "delete": "undo"}

HELP_TEXT = (
    "Send me what you spent and I'll log it:\n"
    "• <i>lunch 250</i>\n"
    "• <i>uber 180 yesterday</i>\n"
    "• or a voice note 🎤\n\n"
    "Commands:\n"
    "/undo – remove the last one\n"
    "/today – what you spent today\n"
    "/month – this month so far\n"
    "/help – this message"
)

UNLINKED_TEXT = (
    "This chat isn't linked to Settle yet.\n"
    "Open Settle → Settings → Telegram and tap <b>Connect Telegram</b>."
)

SAVE_PREFIX = "save:"
CANCEL_PREFIX = "cancel:"

CURRENCY_SYMBOLS = {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£"}

AUDIO_EXTENSIONS = {
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/aac": "m4a",
    "audio/wav": "wav",
    "audio/webm": "webm",
}


# ---------------------------------------------------------------- pure helpers


def local_today() -> date:
    return datetime.now(ZoneInfo(settings.BOT_TIMEZONE)).date()


def generate_link_code() -> str:
    return "".join(secrets.choice(LINK_ALPHABET) for _ in range(LINK_CODE_LENGTH))


def parse_link_code(text: str | None) -> str | None:
    match = LINK_RE.match(text or "")
    return match.group(1).upper() if match else None


def parse_command(text: str | None) -> str | None:
    """'/undo', '/undo@SettleBot', 'undo' and 'Undo!' all mean undo."""
    word = (text or "").strip().lower()
    word = word.split("@", 1)[0].lstrip("/").strip(".!")
    word = COMMAND_ALIASES.get(word, word)
    return word if word in COMMANDS else None


def route_extraction(amount: float | None, confidence: float) -> str:
    """'no_amount' | 'save' | 'draft'."""
    if amount is None or amount <= 0:
        return "no_amount"
    return "save" if confidence >= AUTO_SAVE_CONFIDENCE else "draft"


def pick_category(name: str | None, categories: list[Category]) -> Category | None:
    """Case-insensitive match on the user's categories, falling back to system 'Other'."""
    if name:
        wanted = name.strip().lower()
        for c in categories:
            if c.name.lower() == wanted:
                return c
    return next((c for c in categories if c.is_system and c.name.lower() == "other"), None)


def audio_filename(mime: str | None) -> str:
    base = (mime or "audio/ogg").split(";")[0].strip().lower()
    return f"voice.{AUDIO_EXTENSIONS.get(base, 'ogg')}"


def format_money(amount: Decimal | float, currency: str) -> str:
    value = Decimal(str(amount)).quantize(Decimal("0.01"))
    text = f"{value:,.2f}".removesuffix(".00")
    symbol = CURRENCY_SYMBOLS.get(currency)
    return f"{symbol}{text}" if symbol else f"{currency} {text}"


def deep_link(code: str) -> str | None:
    if not settings.TELEGRAM_BOT_USERNAME:
        return None
    return f"https://t.me/{settings.TELEGRAM_BOT_USERNAME.lstrip('@')}?start={code}"


def _parse_date(value: str | None, fallback: date) -> date:
    if not value:
        return fallback
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return fallback


# ---------------------------------------------------------------- linking


def create_link_code(db: Session, user: User) -> LinkCodeResponse:
    user.telegram_link_code = generate_link_code()
    user.telegram_link_code_expires_at = datetime.now(timezone.utc) + LINK_CODE_TTL
    db.add(user)
    db.commit()
    db.refresh(user)
    return LinkCodeResponse(
        code=user.telegram_link_code,
        expires_at=user.telegram_link_code_expires_at,
        bot_username=settings.TELEGRAM_BOT_USERNAME.lstrip("@") or None,
        deep_link=deep_link(user.telegram_link_code),
    )


def unlink(db: Session, user: User) -> None:
    user.telegram_chat_id = None
    user.telegram_username = None
    user.telegram_linked_at = None
    user.telegram_link_code = None
    user.telegram_link_code_expires_at = None
    db.add(user)
    db.commit()


def link_chat(db: Session, chat_id: int, code: str, username: str | None) -> User | None:
    """Attach the chat to the user holding a live code. None when the code is bad or expired."""
    user = telegram_repo.get_user_by_link_code(db, code)
    if user is None or user.telegram_link_code_expires_at is None:
        return None
    if user.telegram_link_code_expires_at < datetime.now(timezone.utc):
        return None
    owner = telegram_repo.get_user_by_chat(db, chat_id)
    if owner is not None and owner.id != user.id:
        raise ConflictError("This Telegram account is already linked to another Settle account")
    user.telegram_chat_id = chat_id
    user.telegram_username = username
    user.telegram_linked_at = datetime.now(timezone.utc)
    user.telegram_link_code = None
    user.telegram_link_code_expires_at = None
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------- dispatch


def handle_update(db: Session, update: InboundUpdate) -> None:
    record = telegram_repo.record_update(
        db, update_id=update.update_id, chat_id=update.chat_id, kind=update.kind
    )
    if record is None:
        return  # Telegram retry of an update we already handled

    chat = update.chat_id
    try:
        if update.kind == "callback" and update.callback_id:
            tg.answer_callback(update.callback_id)

        user = telegram_repo.get_user_by_chat(db, chat)
        if user is None:
            _handle_unlinked(db, update)
            return
        telegram_repo.attach(db, record, user_id=user.id)

        if update.kind == "callback":
            _handle_button(db, user, update, record)
        elif update.kind == "text":
            if parse_link_code(update.text):
                tg.send_text(chat, "✅ This chat is already linked to your Settle account.")
                return
            command = parse_command(update.text)
            if command:
                _handle_command(db, user, command, chat)
            elif update.text and update.text.strip():
                _handle_expense(db, user, record, chat, text=update.text.strip())
        elif update.kind == "voice" and update.file_id:
            _handle_expense(db, user, record, chat, file_id=update.file_id, mime=update.mime_type)
        else:
            tg.send_text(chat, "I can only read text and voice notes for now. Try <i>lunch 250</i>.")
    except Exception:
        logger.exception("telegram update %s failed", update.update_id)
        db.rollback()
        tg.send_text(chat, "Something went wrong on my side 😕 Please try again in a moment.")


def _handle_unlinked(db: Session, update: InboundUpdate) -> None:
    code = parse_link_code(update.text) if update.kind == "text" else None
    if not code:
        tg.send_text(update.chat_id, UNLINKED_TEXT)
        return
    try:
        user = link_chat(db, update.chat_id, code, update.username)
    except ConflictError as err:
        tg.send_text(update.chat_id, escape(str(err)))
        return
    if user is None:
        tg.send_text(update.chat_id, "That link is invalid or expired. Tap <b>Connect Telegram</b> in Settle again.")
        return
    name = escape((user.name or "").split(" ")[0])
    tg.send_text(update.chat_id, f"🎉 Linked{', ' + name if name else ''}!\n\n{HELP_TEXT}")


def _handle_command(db: Session, user: User, command: str, chat: int) -> None:
    if command == "help":
        tg.send_text(chat, HELP_TEXT)
    elif command == "undo":
        expense = telegram_repo.last_undoable(db, user.id)
        if expense is None:
            tg.send_text(chat, "Nothing to undo from the last 24 hours.")
            return
        expense_controller.delete_expense(db, expense.id, user)
        tg.send_text(
            chat,
            f"🗑️ Removed {format_money(expense.amount, expense.currency)} · {escape(expense.description)}",
        )
    elif command == "today":
        today = local_today()
        rows = spending_repo.split_rows(db, user.id, today, today)
        mine = [r for r in rows if r.currency == user.default_currency]
        total = sum((r.amount for r in mine), Decimal("0"))
        tg.send_text(
            chat,
            f"Today: <b>{format_money(total, user.default_currency)}</b> across {len(mine)} "
            f"expense{'s' if len(mine) != 1 else ''}.",
        )
    elif command == "month":
        today = local_today()
        summary = spending_controller.get_summary(db, user, f"{today.year:04d}-{today.month:02d}", trend_months=2)
        lines = [
            f"{today.strftime('%B')}: <b>{format_money(summary.total, summary.currency)}</b> "
            f"across {summary.expense_count} expenses."
        ]
        for c in summary.by_category[:3]:
            if c.amount > 0:
                lines.append(f"• {escape(c.name)}: {format_money(c.amount, summary.currency)}")
        if summary.overall_budget:
            left = summary.overall_budget - summary.total
            lines.append(f"Budget left: {format_money(left, summary.currency)}")
        tg.send_text(chat, "\n".join(lines))


def _handle_expense(
    db: Session,
    user: User,
    record,
    chat: int,
    *,
    text: str | None = None,
    file_id: str | None = None,
    mime: str | None = None,
) -> None:
    categories = category_repo.get_categories_for_user(db, user.id)
    names = [c.name for c in categories]
    today = local_today()
    try:
        if text is not None:
            source = AISourceType.NL_TEXT
            extracted = ai_client.extract_text(
                text, categories=names, me_name=user.name, currency=user.default_currency, today=today
            )
            raw = text
        else:
            source = AISourceType.VOICE
            audio = tg.download_file(file_id)
            mime_type = (mime or "audio/ogg").split(";")[0]
            extracted = ai_client.extract_voice(
                audio,
                filename=audio_filename(mime_type),
                mime=mime_type,
                categories=names,
                me_name=user.name,
                currency=user.default_currency,
                today=today,
            )
            raw = extracted.transcript
    except ai_client.AIServiceError:
        logger.exception("ai extraction failed")
        tg.send_text(chat, "I couldn't read that right now. Please try again in a moment.")
        return

    decision = route_extraction(extracted.amount, extracted.confidence)
    if decision == "no_amount":
        heard = f"I heard: <i>{escape(raw)}</i>\n" if source == AISourceType.VOICE and raw else ""
        tg.send_text(chat, f"{heard}I couldn't find an amount. Try something like <i>lunch 250</i>.")
        return

    category = pick_category(extracted.category_name, categories)
    payload = {
        "amount": str(extracted.amount),
        "currency": (extracted.currency or user.default_currency).upper()[:3],
        "description": (extracted.description or extracted.merchant or raw or "Expense")[:500],
        "merchant": extracted.merchant,
        "date": _parse_date(extracted.date, today).isoformat(),
        "category_id": str(category.id) if category else None,
        "category_name": category.name if category else None,
    }
    summary = _summary_line(payload)

    if decision == "save":
        expense_id = _create_expense(db, user, payload)
        telegram_repo.attach(db, record, expense_id=expense_id)
        tg.send_text(chat, f"✅ {summary}\nSend /undo to remove.")
        return

    draft = telegram_repo.create_draft(
        db,
        user_id=user.id,
        source_type=source,
        raw_input=raw,
        payload=payload,
        confidence=extracted.confidence,
    )
    telegram_repo.attach(db, record, draft_id=draft.id)
    tg.send_buttons(
        chat,
        f"Did I get this right?\n{summary}",
        [(f"{SAVE_PREFIX}{draft.id}", "✅ Save"), (f"{CANCEL_PREFIX}{draft.id}", "✖️ Cancel")],
    )


def _handle_button(db: Session, user: User, update: InboundUpdate, record) -> None:
    data = update.callback_data or ""
    if data.startswith(SAVE_PREFIX):
        action, raw_id = "save", data[len(SAVE_PREFIX):]
    elif data.startswith(CANCEL_PREFIX):
        action, raw_id = "cancel", data[len(CANCEL_PREFIX):]
    else:
        return
    try:
        draft = telegram_repo.get_draft(db, UUID(raw_id))
    except ValueError:
        draft = None
    if draft is None or draft.user_id != user.id:
        tg.send_text(update.chat_id, "I couldn't find that expense anymore.")
        return
    if draft.status != AIDraftStatus.PENDING:
        return  # a double tap; the buttons were already replaced

    summary = _summary_line(draft.parsed_payload)
    if action == "cancel":
        telegram_repo.resolve_draft(db, draft, AIDraftStatus.DISCARDED)
        _replace_buttons(update, f"✖️ Not saved: {summary}")
        return

    expense_id = _create_expense(db, user, draft.parsed_payload)
    telegram_repo.resolve_draft(db, draft, AIDraftStatus.CONFIRMED, expense_id)
    telegram_repo.attach(db, record, expense_id=expense_id)
    _replace_buttons(update, f"✅ {summary}\nSend /undo to remove.")


def _replace_buttons(update: InboundUpdate, text: str) -> None:
    if update.message_id is not None:
        tg.edit_text(update.chat_id, update.message_id, text)
    else:
        tg.send_text(update.chat_id, text)


def _summary_line(payload: dict) -> str:
    parts = [format_money(Decimal(payload["amount"]), payload["currency"])]
    if payload.get("category_name"):
        parts.append(escape(payload["category_name"]))
    parts.append(escape(payload["description"]))
    line = " · ".join(parts)
    if payload["date"] != local_today().isoformat():
        line += f" ({payload['date']})"
    return line


def _create_expense(db: Session, user: User, payload: dict) -> UUID:
    try:
        amount = Decimal(payload["amount"]).quantize(Decimal("0.01"))
    except (InvalidOperation, KeyError) as err:
        raise ControllerError("draft has no usable amount") from err
    schema = ExpenseCreate(
        description=payload["description"],
        merchant=payload.get("merchant"),
        amount=amount,
        currency=payload["currency"],
        date=date.fromisoformat(payload["date"]),
        notes="Logged via Telegram",
        split_type=SplitType.EQUAL,
        group_id=None,
        category_id=UUID(payload["category_id"]) if payload.get("category_id") else None,
    )
    # create_expense adds the single 100% split for the payer that spending totals read
    expense = expense_controller.create_expense(db, user, schema)
    return expense.id
