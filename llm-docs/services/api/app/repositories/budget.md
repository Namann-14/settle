# services/api/app/repositories/budget.py

**Purpose:** Data access for budgets.

**Key contents:** `get_budget_by_id`, `get_user_budgets`, `get_user_budget_for_category` (None category means overall), `save`, `delete`; each write commits.

**Depends on / used by:** Uses `models/budget.py`; called from `controllers/budget.py`.

**Decisions & caveats:** The overall-vs-category lookup uses `IS NULL` explicitly, matching the two partial unique indexes on `budgets`. Repositories commit themselves, so there is no cross-call transaction.
