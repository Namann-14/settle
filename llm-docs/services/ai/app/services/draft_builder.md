# services/ai/app/services/draft_builder.py

**Purpose:** Converts an LLM `ExtractedExpense` into the API-facing `ExpenseDraft`.

**Key contents:** `build_expense_draft` resolves participants, maps the category name to a real category (confidence 0.9 if found, 0.3 if not), sets the payer, and appends warnings for unresolved/ambiguous names, unknown payer, missing amount, and model notes. `_map_category` helper.

**Depends on / used by:** `chains/extraction`, `services/participants`, `schemas/draft|categorize|common`. Used by `routes/expenses.py`.

**Decisions & caveats:** The payer is only set when the extraction says the user paid; otherwise a warning asks the user to confirm. Warnings are the mechanism for handing gaps back to the human; nothing is created here.
