# services/api/app/routes/recurring.py

**Purpose:** HTTP routes for personal recurring expenses.

**Key contents:** `GET/POST /recurring`, `POST /recurring/sync`, `PATCH/DELETE /recurring/{id}`.

**Depends on / used by:** Delegates to `controllers/recurring.py` and `services/recurrence.py`; schemas in `schemas/recurring.py`.

**Decisions & caveats:** `/sync` is idempotent and called by the dashboard once per session with the client's local date; there is no cron (decisions.md). Deleting a rule keeps expenses it created.
