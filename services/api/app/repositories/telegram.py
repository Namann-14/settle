from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.enums import AIDraftStatus, AISourceType
from app.models.ai_expense_draft import AIExpenseDraft
from app.models.expense import Expense
from app.models.telegram_message import TelegramMessage
from app.models.user import User


def record_update(db: Session, *, update_id: int, chat_id: int, kind: str) -> TelegramMessage | None:
    """Insert the inbound update. None means we've seen this update_id already (a Telegram retry)."""
    msg = TelegramMessage(update_id=update_id, chat_id=chat_id, kind=kind)
    db.add(msg)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(msg)
    return msg


def attach(
    db: Session,
    msg: TelegramMessage,
    *,
    user_id: UUID | None = None,
    expense_id: UUID | None = None,
    draft_id: UUID | None = None,
) -> None:
    if user_id is not None:
        msg.user_id = user_id
    if expense_id is not None:
        msg.expense_id = expense_id
    if draft_id is not None:
        msg.draft_id = draft_id
    db.add(msg)
    db.commit()


def get_user_by_chat(db: Session, chat_id: int) -> User | None:
    stmt = select(User).where(User.telegram_chat_id == chat_id)
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_link_code(db: Session, code: str) -> User | None:
    stmt = select(User).where(User.telegram_link_code == code)
    return db.execute(stmt).scalars().first()


def last_undoable(db: Session, user_id: UUID, within: timedelta = timedelta(hours=24)) -> Expense | None:
    """The newest live expense this user logged through the bot in the last day."""
    since = datetime.now(timezone.utc) - within
    stmt = (
        select(Expense)
        .join(TelegramMessage, TelegramMessage.expense_id == Expense.id)
        .where(
            TelegramMessage.user_id == user_id,
            TelegramMessage.created_at >= since,
            Expense.deleted_at.is_(None),
        )
        .order_by(TelegramMessage.created_at.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


def create_draft(
    db: Session,
    *,
    user_id: UUID,
    source_type: AISourceType,
    raw_input: str | None,
    payload: dict,
    confidence: float,
) -> AIExpenseDraft:
    draft = AIExpenseDraft(
        user_id=user_id,
        source_type=source_type,
        raw_input=raw_input,
        parsed_payload=payload,
        confidence_score=confidence,
        status=AIDraftStatus.PENDING,
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


def get_draft(db: Session, draft_id: UUID) -> AIExpenseDraft | None:
    stmt = select(AIExpenseDraft).where(AIExpenseDraft.id == draft_id)
    return db.execute(stmt).scalar_one_or_none()


def resolve_draft(
    db: Session, draft: AIExpenseDraft, status: AIDraftStatus, expense_id: UUID | None = None
) -> None:
    draft.status = status
    if expense_id is not None:
        draft.resulting_expense_id = expense_id
    db.add(draft)
    db.commit()
