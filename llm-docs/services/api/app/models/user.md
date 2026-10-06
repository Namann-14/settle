# services/api/app/models/user.py

**Purpose:** ORM model for application users, mirrored from Clerk.

**Key contents:** `User` with unique `clerk_user_id`, email, name, `is_active`, `default_currency`, and Telegram link fields (chat id, username, linked_at, one-time link code and expiry). `telegram_linked` property. Relationships to nearly every other model.

**Depends on / used by:** Used everywhere; created by `controllers/user.py` sync via `routes/__init__.py`; Telegram fields used by `repositories/telegram.py`.

**Decisions & caveats:** Users are created lazily on first authenticated request and filled from Clerk. `default_currency` decides which currency counts toward spending totals. Multi-FK relationships need explicit `foreign_keys` strings.
