import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.controllers import telegram as telegram_controller
from app.dependencies.database import get_db
from app.schemas.telegram import parse_update
from app.services import telegram as tg

router = APIRouter(prefix="/webhooks/telegram", tags=["telegram"])


@router.post("")
async def receive_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Inbound updates. Always 200 once the secret checks out: processing errors
    are reported to the user in chat, and a non-2xx would only make Telegram
    retry the same update.
    """
    if not tg.is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Telegram not configured")
    if not tg.verify_secret(request.headers.get("x-telegram-bot-api-secret-token")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bad secret")

    try:
        payload = json.loads(await request.body())
    except ValueError:
        return {"ok": True}

    update = parse_update(payload)
    if update is not None:
        # handle_update is sync (DB + HTTP); keep it off the event loop
        await run_in_threadpool(telegram_controller.handle_update, db, update)
    return {"ok": True}
