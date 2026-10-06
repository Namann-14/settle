# services/api/app/models/chat.py

**Purpose:** ORM models for AI chat history (conversations and messages).

**Key contents:** `ChatConversation` (user-owned, optional title, cascades to messages) and `ChatMessage` (role enum, text content, JSONB `metadata` column exposed as `metadata_`).

**Depends on / used by:** Depends on `app.db.enums.ChatRole`, `models/user.py`. Tables are mainly written by `services/ai`.

**Decisions & caveats:** The attribute is `metadata_` because `metadata` is reserved by SQLAlchemy declarative. `ChatMessage` has no timestamp mixin, only UUID.
