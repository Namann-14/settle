# services/api/app/repositories/income.py

**Purpose:** Data access for income entries.

**Key contents:** Get by id, list for user with optional date range and limit (newest first), `save`, `delete`.

**Depends on / used by:** Uses `models/income.py`; called from `controllers/income.py`.

**Decisions & caveats:** Nothing notable.
