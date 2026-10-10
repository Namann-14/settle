# services/ai/app/services/balances.py

**Purpose:** Computes the user's net balance with every counterparty from raw expenses and settlements.

**Key contents:** `compute_balances` (net per counterparty; positive means they owe me) and `build_balances_response` (sorted `BalancesResponse` with names, direction and net total).

**Depends on / used by:** `schemas/insights`. Used by `routes/insights.py` and `tools/analytics.py`.

**Decisions & caveats:** Uses Decimal to avoid cent-level drift. Assumes a single currency (the user's default); mixed-currency ledgers will mis-state balances, a known limitation (see decisions.md on currency). Soft-deleted expenses are skipped and zero balances dropped.
