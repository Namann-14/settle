# services/ai/app/prompts/shared.py

**Purpose:** Prompt fragments shared by several system prompts.

**Key contents:** `IDENTITY`, `MONEY_RULES` (never invent amounts/currencies, always state currency, round to 2dp) and `DATE_RULES` (has a `{today}` placeholder).

**Depends on / used by:** Interpolated into categorize, chat and extraction prompts.

**Decisions & caveats:** DATE_RULES is formatted later with today's date; the other fragments are static.
