# services/api/app/repositories/recurring.py

**Purpose:** Data access for recurring expense rules.

**Key contents:** Get by id, list a user's personal rules (active first, then by next run date), `save`, `delete`.

**Depends on / used by:** Uses `models/recurring_expense.py`; called from `controllers/recurring.py`. Materialization lives in `services/recurrence.py`.

**Decisions & caveats:** List filters `group_id IS NULL` because recurring is personal-only in v1.
