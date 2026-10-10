# services/api/alembic/versions/7c3e9a41b2d8_whatsapp_bot.py

**Purpose:** Added a WhatsApp bot link to users and an inbound message log.

**Key contents:** New `users` columns (`whatsapp_phone`, linked-at, link code and expiry) with unique/index constraints; table `whatsapp_messages` (unique `wamid`, kind, links to user, expense, draft).

**Depends on / used by:** Revises `5b1e0c7d9a21`; removed by `a4f1c8d2e6b3`.

**Decisions & caveats:** Superseded within the same day: WhatsApp Cloud API needs a verified business, so the bot moved to Telegram. It remains in history because the migration chain must stay linear.
