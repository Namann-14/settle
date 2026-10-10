# services/api/app/models/recurring_expense.py

**Purpose:** ORM models for recurring expense rules and their per-user splits.

**Key contents:** `RecurringExpense` (description, amount, currency, split type, `frequency`, `interval`, start/end/`next_run_date`, `is_active`, group/category/payer/creator FKs) and `RecurringExpenseSplit` (unique per rule+user).

**Depends on / used by:** Used by `repositories/recurring.py`, `services/recurrence.py`, `models/expense.py` (`recurring_expense_id`).

**Decisions & caveats:** Personal-only in v1 even though `group_id` and splits exist in the schema. `next_run_date` is indexed because sync queries it. Rules are advanced by `POST /recurring/sync`, not cron (decisions.md). Deleting a rule keeps already-created expenses (FK SET NULL).
