import json

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.controllers import whatsapp as whatsapp_controller
from app.core.config import settings
from app.dependencies.database import get_db
from app.schemas.whatsapp import parse_webhook
from app.services import whatsapp as wa

router = APIRouter(prefix="/webhooks/whatsapp", tags=["whatsapp"])


@router.get("", response_class=PlainTextResponse)
def verify_webhook(
    mode: str | None = Query(None, alias="hub.mode"),
    token: str | None = Query(None, alias="hub.verify_token"),
    challenge: str | None = Query(None, alias="hub.challenge"),
):
    """Meta's one-time subscription handshake: echo hub.challenge if the token matches."""
    if (
        mode == "subscribe"
        and settings.WHATSAPP_VERIFY_TOKEN
        and token == settings.WHATSAPP_VERIFY_TOKEN
        and challenge is not None
    ):
        return challenge
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification failed")


@router.post("")
async def receive_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Inbound messages. Always 200 once the signature checks out: processing
    errors are reported to the user in chat, and a non-2xx would only make
    Meta retry the same message.
    """
    if not wa.is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="WhatsApp not configured")

    raw = await request.body()
    if not wa.verify_signature(raw, request.headers.get("x-hub-signature-256")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bad signature")

    try:
        payload = json.loads(raw)
    except ValueError:
        return {"ok": True}

    for msg in parse_webhook(payload):
        # handle_message is sync (DB + HTTP); keep it off the event loop
        await run_in_threadpool(whatsapp_controller.handle_message, db, msg)
    return {"ok": True}

