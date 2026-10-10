# services/ai/app/prompts/__init__.py

**Purpose:** Re-exports the prompt constants.

**Key contents:** Exports IDENTITY, MONEY_RULES, DATE_RULES, and the categorize, extraction, receipt extraction, chat and insight prompts.

**Depends on / used by:** Used by chains and agents.

**Decisions & caveats:** Followups and settle prompts are not re-exported here and are imported by module path directly.
