# services/api/app/routes/budgets.py

**Purpose:** HTTP routes for monthly budgets.

**Key contents:** `GET /budgets`, `PUT /budgets` (upsert overall or per-category), `DELETE /budgets/{id}`.

**Depends on / used by:** Delegates to `controllers/budget.py`; schemas in `schemas/budget.py`.

**Decisions & caveats:** Upsert (PUT) matches the one-budget-per-category and one-overall rules, so there is no POST. Budgets are standing monthly limits, not per-month rows (decisions.md).
