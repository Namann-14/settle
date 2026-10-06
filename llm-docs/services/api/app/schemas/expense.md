# services/api/app/schemas/expense.py

**Purpose:** Pydantic schemas for expenses.

**Key contents:** `ExpenseCreate`, `ExpenseUpdate` (all optional, optional `splits` list), `ExpenseResponse` (includes splits and `recurring_expense_id`).

**Depends on / used by:** Used by `routes/expenses.py`, `repositories/expense.py`, `schemas/expense_split.py`.

**Decisions & caveats:** Amounts must be > 0. `paid_by_id` and `created_by_id` are optional on create and filled by the controller. Update uses `exclude_unset`, so omitting `splits` leaves splits untouched while an empty list would clear them.
