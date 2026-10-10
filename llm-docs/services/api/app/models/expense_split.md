# services/api/app/models/expense_split.py

**Purpose:** ORM model for one user's share of an expense.

**Key contents:** `ExpenseSplit` with expense_id, user_id, `amount_owed`, optional `percentage` and reserved `share`. Unique per (expense, user), index on user_id.

**Depends on / used by:** Used by `repositories/expense.py`, `repositories/spending.py`, `services/balances.py`, `services/recurrence.py`.

**Decisions & caveats:** `amount_owed` is the source of truth for balances and for 'my spending' (decisions.md). `percentage` is the source for PERCENTAGE splits; `share` is reserved for a future SHARES split type. Personal expenses carry one 100% split for the owner.
