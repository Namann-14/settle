from datetime import datetime

from pydantic import BaseModel


class LinkCodeResponse(BaseModel):
    code: str
    expires_at: datetime
    bot_number: str | None = None


class InboundMessage(BaseModel):
    """The slice of a WhatsApp webhook message the bot acts on."""

    wamid: str
    from_phone: str
    kind: str  # text | audio | interactive | other
    text: str | None = None
    media_id: str | None = None
    mime_type: str | None = None
    button_id: str | None = None


def parse_webhook(payload: dict) -> list[InboundMessage]:
    """
    Flatten entry[].changes[].value.messages[] into InboundMessages.
    Delivery/read receipts (value.statuses) carry no messages and are skipped.
    """
    out: list[InboundMessage] = []
    for entry in payload.get("entry") or []:
        for change in entry.get("changes") or []:
            value = change.get("value") or {}
            for m in value.get("messages") or []:
                wamid, sender, mtype = m.get("id"), m.get("from"), m.get("type")
                if not wamid or not sender:
                    continue
                msg = InboundMessage(wamid=wamid, from_phone=sender, kind="other")
                if mtype == "text":
                    msg.kind = "text"
                    msg.text = (m.get("text") or {}).get("body")
                elif mtype == "audio":
                    audio = m.get("audio") or {}
                    msg.kind = "audio"
                    msg.media_id = audio.get("id")
                    msg.mime_type = audio.get("mime_type")
                elif mtype == "interactive":
                    reply = (m.get("interactive") or {}).get("button_reply") or {}
                    msg.kind = "interactive"
                    msg.button_id = reply.get("id")
                elif mtype == "button":
                    msg.kind = "interactive"
                    msg.button_id = (m.get("button") or {}).get("payload")
                out.append(msg)
    return out
