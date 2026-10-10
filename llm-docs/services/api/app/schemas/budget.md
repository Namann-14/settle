# services/api/app/schemas/budget.py

**Purpose:** Pydantic schemas for budgets.

**Key contents:** `BudgetUpsert` (nullable `category_id`, positive amount, optional currency) and `BudgetResponse`.

**Depends on / used by:** Used by `routes/budgets.py`, `controllers/budget.py`.

**Decisions & caveats:** `category_id: null` means the overall monthly budget. Currency defaults to the user's default if omitted (resolved in the controller).
