"""
WhatsApp bot: turns inbound messages into personal expenses.

Flow per message: dedupe on wamid, resolve the sender's phone to a user (or
run the LINK handshake), then either answer a command or extract an expense.
Confident extractions save straight away; shaky ones become a pending
AIExpenseDraft behind Save / Cancel buttons.
"""

from __future__ import annotations

import logging
import re
import secrets
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
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
from app.repositories import whatsapp as whatsapp_repo
from app.schemas.expense import ExpenseCreate
from app.schemas.whatsapp import InboundMessage, LinkCodeResponse
from app.services import ai_client
from app.services import whatsapp as wa

logger = logging.getLogger(__name__)

AUTO_SAVE_CONFIDENCE = 0.75
LINK_CODE_TTL = timedelta(minutes=15)
# no 0/O, 1/I/L: codes get typed by hand sometimes
LINK_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
LINK_CODE_LENGTH = 6
LINK_RE = re.compile(r"^\s*link\s+([A-Za-z0-9]{4,8})\s*$", re.IGNORECASE)

COMMANDS = {"help", "undo", "today", "month"}
COMMAND_ALIASES = {"hi": "help", "hello": "help", "menu": "help", "?": "help", "delete": "undo"}

HELP_TEXT = (
    "Send me what you spent and I'll log it:\n"
    "• _lunch 250_\n"
    "• _uber 180 yesterday_\n"
    "• or a voice note 🎤\n\n"
    "Commands:\n"
    "*undo* – remove the last one\n"
    "*today* – what you spent today\n"
    "*month* – this month so far\n"
    "*help* – this message"
)

UNLINKED_TEXT = (
    "This number isn't linked to Settle yet.\n"
    "Open Settle → Settings → WhatsApp, tap *Generate code*, and send it here as "
    "_LINK ABC123_."
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
    return datetime.now(ZoneInfo(settings.WHATSAPP_TIMEZONE)).date()


def generate_link_code() -> str:
    return "".join(secrets.choice(LINK_ALPHABET) for _ in range(LINK_CODE_LENGTH))


def parse_link_code(text: str | None) -> str | None:
    match = LINK_RE.match(text or "")
    return match.group(1).upper() if match else None


def parse_command(text: str | None) -> str | None:
    word = (text or "").strip().lower().strip(".!")
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


def _parse_date(value: str | None, fallback: date) -> date:
    if not value:
        return fallback
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return fallback


# ---------------------------------------------------------------- linking


def create_link_code(db: Session, user: User) -> LinkCodeResponse:
    user.whatsapp_link_code = generate_link_code()
    user.whatsapp_link_code_expires_at = datetime.now(timezone.utc) + LINK_CODE_TTL
    db.add(user)
    db.commit()
    db.refresh(user)
    return LinkCodeResponse(
        code=user.whatsapp_link_code,
        expires_at=user.whatsapp_link_code_expires_at,
        bot_number=settings.WHATSAPP_BOT_NUMBER or None,
    )


def unlink(db: Session, user: User) -> None:
    user.whatsapp_phone = None
    user.whatsapp_linked_at = None
    user.whatsapp_link_code = None
    user.whatsapp_link_code_expires_at = None
    db.add(user)
    db.commit()


def link_phone(db: Session, phone: str, code: str) -> User | None:
    """Attach phone to the user holding a live code. None when the code is bad or expired."""
    user = whatsapp_repo.get_user_by_link_code(db, code)
    if user is None or user.whatsapp_link_code_expires_at is None:
        return None
    if user.whatsapp_link_code_expires_at < datetime.now(timezone.utc):
        return None
    owner = whatsapp_repo.get_user_by_phone(db, phone)
    if owner is not None and owner.id != user.id:
        raise ConflictError("This number is already linked to another Settle account")
    user.whatsapp_phone = phone
    user.whatsapp_linked_at = datetime.now(timezone.utc)
    user.whatsapp_link_code = None
    user.whatsapp_link_code_expires_at = None
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------- dispatch


def handle_message(db: Session, msg: InboundMessage) -> None:
    record = whatsapp_repo.record_message(db, wamid=msg.wamid, from_phone=msg.from_phone, kind=msg.kind)
    if record is None:
        return  # Meta retry of a message we already handled

    to = msg.from_phone
    try:
        user = whatsapp_repo.get_user_by_phone(db, msg.from_phone)
        if user is None:
            _handle_unlinked(db, msg)
            return
        whatsapp_repo.attach(db, record, user_id=user.id)

        if msg.kind == "interactive":
            _handle_button(db, user, msg, record)
        elif msg.kind == "text":
            code = parse_link_code(msg.text)
            if code:
                wa.send_text(to, "✅ This number is already linked to your Settle account.")
                return
            command = parse_command(msg.text)
            if command:
                _handle_command(db, user, command, to)
            elif msg.text and msg.text.strip():
                _handle_expense(db, user, record, to, text=msg.text.strip())
        elif msg.kind == "audio" and msg.media_id:
            _handle_expense(db, user, record, to, media_id=msg.media_id, mime=msg.mime_type)
        else:
            wa.send_text(to, "I can only read text and voice notes for now. Try _lunch 250_.")
    except Exception:
        logger.exception("whatsapp message %s failed", msg.wamid)
        db.rollback()
        wa.send_text(to, "Something went wrong on my side 😕 Please try again in a moment.")


def _handle_unlinked(db: Session, msg: InboundMessage) -> None:
    code = parse_link_code(msg.text) if msg.kind == "text" else None
    if not code:
        wa.send_text(msg.from_phone, UNLINKED_TEXT)
        return
    try:
        user = link_phone(db, msg.from_phone, code)
    except ConflictError as err:
        wa.send_text(msg.from_phone, str(err))
        return
    if user is None:
        wa.send_text(msg.from_phone, "That code is invalid or expired. Generate a new one in Settle.")
        return
    name = (user.name or "").split(" ")[0]
    wa.send_text(msg.from_phone, f"🎉 Linked{', ' + name if name else ''}!\n\n{HELP_TEXT}")


def _handle_command(db: Session, user: User, command: str, to: str) -> None:
    if command == "help":
        wa.send_text(to, HELP_TEXT)
    elif command == "undo":
        expense = whatsapp_repo.last_undoable(db, user.id)
        if expense is None:
            wa.send_text(to, "Nothing to undo from the last 24 hours.")
            return
        expense_controller.delete_expense(db, expense.id, user)
        wa.send_text(
            to, f"🗑️ Removed {format_money(expense.amount, expense.currency)} · {expense.description}"
        )
    elif command == "today":
        today = local_today()
        rows = spending_repo.split_rows(db, user.id, today, today)
        mine = [r for r in rows if r.currency == user.default_currency]
        total = sum((r.amount for r in mine), Decimal("0"))
        wa.send_text(
            to,
            f"Today: *{format_money(total, user.default_currency)}* across {len(mine)} "
            f"expense{'s' if len(mine) != 1 else ''}.",
        )
    elif command == "month":
        today = local_today()
        summary = spending_controller.get_summary(db, user, f"{today.year:04d}-{today.month:02d}", trend_months=2)
        lines = [
            f"{today.strftime('%B')}: *{format_money(summary.total, summary.currency)}* "
            f"across {summary.expense_count} expenses."
        ]
        for c in summary.by_category[:3]:
            if c.amount > 0:
                lines.append(f"• {c.name}: {format_money(c.amount, summary.currency)}")
        if summary.overall_budget:
            left = summary.overall_budget - summary.total
            lines.append(f"Budget left: {format_money(left, summary.currency)}")
        wa.send_text(to, "\n".join(lines))


def _handle_expense(
    db: Session,
    user: User,
    record,
    to: str,
    *,
    text: str | None = None,
    media_id: str | None = None,
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
            audio, mime_type = wa.download_media(media_id)
            extracted = ai_client.extract_voice(
                audio,
                filename=audio_filename(mime or mime_type),
                mime=(mime or mime_type).split(";")[0],
                categories=names,
                me_name=user.name,
                currency=user.default_currency,
                today=today,
            )
            raw = extracted.transcript
    except ai_client.AIServiceError:
        logger.exception("ai extraction failed")
        wa.send_text(to, "I couldn't read that right now. Please try again in a moment.")
        return

    decision = route_extraction(extracted.amount, extracted.confidence)
    if decision == "no_amount":
        heard = f"I heard: _{raw}_\n" if source == AISourceType.VOICE and raw else ""
        wa.send_text(to, f"{heard}I couldn't find an amount. Try something like _lunch 250_.")
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
        whatsapp_repo.attach(db, record, expense_id=expense_id)
        wa.send_text(to, f"✅ {summary}\nReply *undo* to remove.")
        return

    draft = whatsapp_repo.create_draft(
        db,
        user_id=user.id,
        source_type=source,
        raw_input=raw,
        payload=payload,
        confidence=extracted.confidence,
    )
    whatsapp_repo.attach(db, record, draft_id=draft.id)
    wa.send_buttons(
        to,
        f"Did I get this right?\n{summary}",
        [(f"{SAVE_PREFIX}{draft.id}", "Save"), (f"{CANCEL_PREFIX}{draft.id}", "Cancel")],
    )


def _handle_button(db: Session, user: User, msg: InboundMessage, record) -> None:
    bid = msg.button_id or ""
    if bid.startswith(SAVE_PREFIX):
        action, raw_id = "save", bid[len(SAVE_PREFIX):]
    elif bid.startswith(CANCEL_PREFIX):
        action, raw_id = "cancel", bid[len(CANCEL_PREFIX):]
    else:
        return
    try:
        draft = whatsapp_repo.get_draft(db, UUID(raw_id))
    except ValueError:
        draft = None
    if draft is None or draft.user_id != user.id:
        wa.send_text(msg.from_phone, "I couldn't find that expense anymore.")
        return
    if draft.status != AIDraftStatus.PENDING:
        wa.send_text(msg.from_phone, "Already handled 👍")
        return

    if action == "cancel":
        whatsapp_repo.resolve_draft(db, draft, AIDraftStatus.DISCARDED)
        wa.send_text(msg.from_phone, "Okay, not saved.")
        return

    expense_id = _create_expense(db, user, draft.parsed_payload)
    whatsapp_repo.resolve_draft(db, draft, AIDraftStatus.CONFIRMED, expense_id)
    whatsapp_repo.attach(db, record, expense_id=expense_id)
    wa.send_text(msg.from_phone, f"✅ {_summary_line(draft.parsed_payload)}\nReply *undo* to remove.")


def _summary_line(payload: dict) -> str:
    parts = [format_money(Decimal(payload["amount"]), payload["currency"])]
    if payload.get("category_name"):
        parts.append(payload["category_name"])
    parts.append(payload["description"])
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
        notes="Logged via WhatsApp",
        split_type=SplitType.EQUAL,
        group_id=None,
        category_id=UUID(payload["category_id"]) if payload.get("category_id") else None,
    )
    # create_expense adds the single 100% split for the payer that spending totals read
    expense = expense_controller.create_expense(db, user, schema)
    return expense.id
