# services/ai/app/prompts/categorize.py

**Purpose:** System prompt for expense categorization.

**Key contents:** `CATEGORIZE_SYSTEM` with `{categories}` placeholder, enforcing exact category names or null, honest confidence and one-line reasoning.

**Depends on / used by:** Used by chains/categorize.

**Decisions & caveats:** Models must never invent a category name; the route treats off-list names as no match.
