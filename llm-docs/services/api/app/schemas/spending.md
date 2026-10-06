# services/api/app/schemas/spending.py

**Purpose:** Response schema for the spending summary.

**Key contents:** `SpendingSummary` plus parts: `CategorySpend` (with budget), `DailySpend`, `MonthSpend`, `MerchantSpend`, `CurrencyTotal`; totals, previous total, personal vs group share, overall budget, income and net.

**Depends on / used by:** Built by `controllers/spending.py`; consumed by the web Spending page and the AI service tools.

**Decisions & caveats:** Spending is the user's own share. Only the user's `currency` counts toward totals; others go to `other_currencies` and are never converted (decisions.md).
