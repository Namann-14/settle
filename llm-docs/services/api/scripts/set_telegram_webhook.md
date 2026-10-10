# services/api/scripts/set_telegram_webhook.py

**Purpose:** Script to register the Telegram webhook and command menu.

**Key contents:** Calls `setWebhook` with the secret token and allowed updates, `setMyCommands` (today, month, undo, help), or `getWebhookInfo` with `--info`.

**Depends on / used by:** Uses `services/telegram.py` and settings `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`.

**Decisions & caveats:** Must be re-run whenever the URL changes (new tunnel, production). Requires an https URL. `drop_pending_updates` is true, so queued messages are discarded.
