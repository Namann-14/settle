# services/api/alembic/versions/a4f1c8d2e6b3_telegram_bot.py

**Purpose:** Replaces the WhatsApp bot schema with a Telegram one.

**Key contents:** Drops `whatsapp_messages` and the `whatsapp_*` user columns; adds `telegram_chat_id` (BigInteger, unique), username, linked-at, link code and expiry to `users`; creates `telegram_messages` (update_id, chat_id, kind, links to user/expense/draft).

**Depends on / used by:** Revises `7c3e9a41b2d8`. Used by `app/controllers/telegram.py` and the telegram model.

**Decisions & caveats:** WhatsApp columns are dropped, not migrated, because no WhatsApp link ever went live. The message table exists for webhook idempotency by Telegram `update_id`. Note the downgrade section recreating `whatsapp_messages` references the original schema.
