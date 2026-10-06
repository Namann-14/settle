# services/api/app/models/telegram_message.py

**Purpose:** ORM model recording each inbound Telegram update for idempotency and undo.

**Key contents:** `TelegramMessage` with unique `update_id`, `chat_id`, `kind` (text/voice/callback/other), and nullable user, expense and AI draft FKs.

**Depends on / used by:** Used by `repositories/telegram.py` and `controllers/telegram.py`.

**Decisions & caveats:** The unique `update_id` makes Telegram webhook retries no-ops (IntegrityError means duplicate). `expense_id` is what the bot's 'undo' reverses. FKs are SET NULL except user (CASCADE).
