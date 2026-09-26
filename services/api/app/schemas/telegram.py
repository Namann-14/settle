from datetime import datetime

from pydantic import BaseModel


class LinkCodeResponse(BaseModel):
    code: str
    expires_at: datetime
    bot_username: str | None = None
    # t.me/<bot>?start=<code>: one tap on Start links the account
    deep_link: str | None = None


class InboundUpdate(BaseModel):
    """The slice of a Telegram update the bot acts on."""

    update_id: int
    chat_id: int
    kind: str  # text | voice | callback | other
    username: str | None = None
    text: str | None = None
    file_id: str | None = None
    mime_type: str | None = None
    callback_id: str | None = None
    callback_data: str | None = None
    # the bot message a callback button belongs to, so it can be edited
    message_id: int | None = None


def parse_update(payload: dict) -> InboundUpdate | None:
    """
    Flatten a Telegram update. Only private chats count: in a group the bot
    would see other people's messages. Edits, joins and the like return None.
    """
    update_id = payload.get("update_id")
    if not isinstance(update_id, int):
        return None

    callback = payload.get("callback_query")
    if callback:
        message = callback.get("message") or {}
        chat = message.get("chat") or {}
        if chat.get("type") != "private":
            return None
        return InboundUpdate(
            update_id=update_id,
            chat_id=chat["id"],
            kind="callback",
            username=(callback.get("from") or {}).get("username"),
            callback_id=callback.get("id"),
            callback_data=callback.get("data"),
            message_id=message.get("message_id"),
        )

    message = payload.get("message")
    if not message:
        return None
    chat = message.get("chat") or {}
    if chat.get("type") != "private":
        return None
    update = InboundUpdate(
        update_id=update_id,
        chat_id=chat["id"],
        kind="other",
        username=(message.get("from") or {}).get("username"),
    )
    if message.get("text"):
        update.kind = "text"
        update.text = message["text"]
    elif message.get("voice") or message.get("audio"):
        media = message.get("voice") or message.get("audio")
        update.kind = "voice"
        update.file_id = media.get("file_id")
        update.mime_type = media.get("mime_type")
    return update
