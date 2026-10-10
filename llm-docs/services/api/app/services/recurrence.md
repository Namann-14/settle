# services/api/app/services/recurrence.py

**Purpose:** Date math and materialization for recurring expenses.

**Key contents:** `next_date` (daily, weekly, monthly, yearly with anchor day clamped to month end) and `materialize_due`, which creates an expense plus a 100% owner split for each due occurrence and advances the rule.

**Depends on / used by:** Uses `models/recurring_expense.py`, `models/expense.py`; called via `controllers/recurring.py` from `POST /recurring/sync`; tested by `tests/test_recurrence.py`.

**Decisions & caveats:** Rules are locked with `FOR UPDATE SKIP LOCKED` so two tabs cannot double-log. Catch-up capped at 24 occurrences per rule per sync (`MAX_CATCH_UP`). Month-end clamping uses the start date's day so Jan 31 runs Feb 28/29 then Mar 31. A rule deactivates when its next run passes `end_date`. Personal rules only. See decisions.md.
