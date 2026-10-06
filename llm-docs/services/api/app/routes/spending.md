# services/api/app/routes/spending.py

**Purpose:** HTTP route for the monthly spending summary.

**Key contents:** `GET /spending/summary?month=YYYY-MM&trend_months=1..24`.

**Depends on / used by:** Delegates to `controllers/spending.py`; response schema `schemas/spending.py`; reads via `repositories/spending.py`.

**Decisions & caveats:** Returns the user's own share only, counting the user's default currency; other currencies are listed separately (decisions.md). Also read by the AI service's `get_spending_summary` tool.
