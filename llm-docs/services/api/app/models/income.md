# services/api/app/models/income.py

**Purpose:** ORM model for simple income entries used by the spending tracker.

**Key contents:** `Income` with amount, currency, date, source, notes, user FK (cascade). Index on (user_id, date).

**Depends on / used by:** Used by `repositories/income.py`, `repositories/spending.py` (income total and savings).

**Decisions & caveats:** Kept separate from expenses so balances and splits stay untouched (decisions.md). Only totals in the user's default currency are counted.
