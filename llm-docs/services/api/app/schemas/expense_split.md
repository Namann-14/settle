# services/api/app/schemas/expense_split.py

**Purpose:** Pydantic schemas for expense splits.

**Key contents:** `ExpenseSplitCreate`, `ExpenseSplitUpdate`, `ExpenseSplitResponse` with `amount_owed`, optional `percentage` (0-100) and `share`.

**Depends on / used by:** Used by `schemas/expense.py`, `repositories/expense.py`.

**Decisions & caveats:** Sum validation against the expense amount is not done here.
