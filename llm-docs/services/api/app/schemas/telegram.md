# services/api/app/schemas/telegram.py

**Purpose:** Schemas and parser for the Telegram bot.

**Key contents:** `LinkCodeResponse`, `InboundUpdate` (flattened update), and `parse_update`, which flattens text, voice/audio and callback-query updates.

**Depends on / used by:** Used by `routes/telegram.py`, `routes/users.py`, `controllers/telegram.py`, `tests/test_telegram.py`.

**Decisions & caveats:** Only private chats are handled; group messages, edits and joins return None so the bot never sees other people's messages. Photos and other media become `kind=other`.
