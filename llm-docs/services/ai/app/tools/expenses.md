# services/ai/app/tools/expenses.py

**Purpose:** Chat tools for reading expenses.

**Key contents:** `list_my_expenses` (optional group filter, limit capped at 100, pipe-separated table) and `get_expense_details` (one expense with its per-user splits).

**Depends on / used by:** `services/context`, `core/errors`. Registered in `tools/__init__.py`.

**Decisions & caveats:** The docstring tells the model to use real group UUIDs from `list_my_groups` rather than guessing. Output is truncated with a "showing N of M" footer to limit tokens.
