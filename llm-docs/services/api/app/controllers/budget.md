# services/api/app/controllers/budget.py

**Purpose:** Business logic for standing monthly budgets.

**Key contents:** `list_budgets`, `upsert_budget` (create on first set, update after; `category_id` null means the overall budget) and `delete_budget` with ownership checks.

**Depends on / used by:** `repositories/budget`, `controllers/category` (validates category access), `schemas/budget`, `models/budget`. Called from `routes/budgets.py`.

**Decisions & caveats:** Upsert semantics mirror the two partial unique indexes on `budgets` (one per user+category, one overall). Currency defaults to the user's `default_currency`. Raises domain exceptions that the routes map to HTTP codes.
