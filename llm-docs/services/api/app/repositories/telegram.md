# services/api/app/repositories/telegram.py

**Purpose:** Data access for the Telegram bot: update log, users by chat or code, drafts, undo.

**Key contents:** `record_update` (returns None on duplicate update_id), `attach`, lookups by chat id and link code, `last_undoable`, and AI draft create/get/resolve.

**Depends on / used by:** Uses `models/telegram_message.py`, `models/ai_expense_draft.py`, `models/user.py`; called from `controllers/telegram.py`.

**Decisions & caveats:** Idempotency relies on catching the unique-constraint `IntegrityError` and rolling back. `last_undoable` only considers live expenses logged via the bot in the last 24 hours.
