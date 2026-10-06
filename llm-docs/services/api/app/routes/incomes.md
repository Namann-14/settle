# services/api/app/routes/incomes.py

**Purpose:** HTTP routes for income entries.

**Key contents:** `GET /incomes` (date range, limit up to 500), `POST`, `PATCH /{id}`, `DELETE /{id}`.

**Depends on / used by:** Delegates to `controllers/income.py`; schemas in `schemas/income.py`.

**Decisions & caveats:** Nothing notable.
