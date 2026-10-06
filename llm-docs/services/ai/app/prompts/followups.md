# services/ai/app/prompts/followups.py

**Purpose:** System prompt for follow-up suggestions.

**Key contents:** `FOLLOWUPS_SYSTEM`: exactly three short questions (under 8 words) answerable from the user's own read-only data.

**Depends on / used by:** Used by chains/followups.

**Decisions & caveats:** Suggestions must never propose write actions because the assistant is read-only.
