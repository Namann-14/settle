# services/api/app/models/ai_expense_draft.py

**Purpose:** ORM model for AI-produced expense drafts awaiting user confirmation.

**Key contents:** `AIExpenseDraft` with source type, raw input, optional receipt `file_url`, JSONB `parsed_payload`, confidence, status (PENDING/CONFIRMED/DISCARDED/EDITED), user, and nullable `resulting_expense_id`.

**Depends on / used by:** `db/enums`, `db/mixins`; relates to `User` and `Expense`. Used by the Telegram flow for Save/Cancel drafts and referenced by `telegram_messages`.

**Decisions & caveats:** The AI output is JSONB so prompt or model changes need no migration. `file_url` references blob storage rather than storing the file. The expense link is SET NULL on expense deletion.
