# services/api/app/models/expense.py

**Purpose:** ORM model for an expense, personal or group.

**Key contents:** `Expense` with description, merchant, amount, currency, date, notes, `split_type`, soft-delete `deleted_at`, and FKs to group, category, payer, creator and optional recurring rule. Indexes on group+date, payer, creator, group, date. Cascading `splits` relationship.

**Depends on / used by:** Used by `repositories/expense.py`, `repositories/spending.py`, `services/balances.py`, `services/recurrence.py`, `models/expense_split.py`.

**Decisions & caveats:** `group_id` NULL means a personal expense. Deletes are soft (`deleted_at`), so every query must filter `deleted_at IS NULL`. Payer/creator FKs are RESTRICT, category and recurring FKs are SET NULL, group FK is CASCADE.
