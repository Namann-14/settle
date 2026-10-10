# services/api/app/controllers/expense.py

**Purpose:** Business logic for creating, reading, listing, updating and deleting expenses, personal or group.

**Key contents:** `_validate_splits` enforces per-split-type rules (percentages sum to 100, equal splits distribute the rounding remainder to the first split, unequal totals must match the amount); `create_expense` forces the caller as creator, defaults payer to the caller, and validates group membership of payer and split users; `get_expense` allows creator, payer, split participants, or group members; update re-validates splits; delete is a soft delete.

**Depends on / used by:** `repositories/expense|group`, `schemas/expense|expense_split`, `db/enums.SplitType`. Used by `routes/expenses.py` and the Telegram controller.

**Decisions & caveats:** A personal expense gets a single 100% split for its owner, which is what the "my spending" query sums (see decisions.md). Equal and percentage splits silently correct small amount drifts rather than rejecting them.
