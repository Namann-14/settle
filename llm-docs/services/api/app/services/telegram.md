# services/api/app/services/telegram.py

**Purpose:** Thin client for the Telegram Bot API.

**Key contents:** `is_configured`, `verify_secret` (constant-time compare), `call`, `send_text`, `send_buttons`, `answer_callback`, `edit_text`, `download_file`.

**Depends on / used by:** Uses `core/config.py`; used by `routes/telegram.py`, `controllers/telegram.py`, `scripts/set_telegram_webhook.py`.

**Decisions & caveats:** `call` logs and swallows failures so a failed reply never fails the webhook (which would trigger Telegram retries). Messages are sent as HTML and truncated to 4096 chars; callers must escape user text. Button callback data is limited to 64 bytes. Bot downloads are capped at 20 MB.
