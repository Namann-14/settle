# services/api/app/controllers/telegram.py

**Purpose:** Telegram expense bot logic: account linking, commands, expense capture from text or voice, and save/cancel buttons.

**Key contents:** Per update: dedupe on `update_id`, resolve chat to a user or run the `/start <code>` link handshake, then handle a command (`help`, `undo`, `today`, `month`) or extract an expense via the AI service. Confident extractions (`AUTO_SAVE_CONFIDENCE = 0.75`) save immediately; shaky ones become a pending `AIExpenseDraft` with Save/Cancel buttons. Link codes are 8 characters, 15 minute TTL, from an alphabet without look-alike characters.

**Depends on / used by:** `services/ai_client`, `services/telegram`, `controllers/expense|spending`, `repositories/telegram|category|spending`, `schemas/telegram`, `core/config`. Used by `routes/telegram.py` webhook.

**Decisions & caveats:** Replaced the WhatsApp bot (migration `a4f1c8d2e6b3`). The bot has no Clerk session, so identity is the linked chat id and the AI calls use the shared internal key. Category falls back to system "Other". `undo` only affects bot-created expenses from the last 24 hours. Text is HTML-escaped before sending.
