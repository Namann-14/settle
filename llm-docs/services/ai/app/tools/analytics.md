# services/ai/app/tools/analytics.py

**Purpose:** Chat tools for balances, monthly spending, and budget status.

**Key contents:** `get_my_balances` (computed locally via `services/balances`), `get_spending_summary` (reads services/api's `/spending/summary` and formats text), `get_budget_status`, plus formatting helpers.

**Depends on / used by:** `services/balances`, `services/context`, `core/errors`. Registered in `tools/__init__.py`.

**Decisions & caveats:** Spending is the user's own share (a 4-way group dinner counts a quarter), matching the API summary rule in decisions.md. Tool docstrings tell the model to prefer these over summing expenses itself. Like all tools, a 401 is re-raised while other API errors become an "error:" string the model can read.
