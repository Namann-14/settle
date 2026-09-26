"""
Point the Telegram bot at a webhook URL and register its command menu.

    uv run python -m scripts.set_telegram_webhook https://<host>/webhooks/telegram
    uv run python -m scripts.set_telegram_webhook --info

Uses TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET from .env. Run it again
whenever the URL changes (a new tunnel, or moving to production).
"""

import sys

from app.core.config import settings
from app.services import telegram as tg

COMMANDS = [
    {"command": "today", "description": "What you spent today"},
    {"command": "month", "description": "This month so far"},
    {"command": "undo", "description": "Remove the last expense"},
    {"command": "help", "description": "How to use the bot"},
]


def main() -> None:
    if not settings.TELEGRAM_BOT_TOKEN:
        sys.exit("TELEGRAM_BOT_TOKEN is not set")
    if "--info" in sys.argv:
        print(tg.call("getWebhookInfo", {}))
        return
    if len(sys.argv) < 2 or not sys.argv[1].startswith("https://"):
        print(__doc__)
        sys.exit(1)
    if not settings.TELEGRAM_WEBHOOK_SECRET:
        sys.exit("TELEGRAM_WEBHOOK_SECRET is not set")

    ok = tg.call(
        "setWebhook",
        {
            "url": sys.argv[1],
            "secret_token": settings.TELEGRAM_WEBHOOK_SECRET,
            "allowed_updates": ["message", "callback_query"],
            "drop_pending_updates": True,
        },
    )
    tg.call("setMyCommands", {"commands": COMMANDS})
    print("webhook set" if ok else "setWebhook failed (see log above)")


if __name__ == "__main__":
    main()
