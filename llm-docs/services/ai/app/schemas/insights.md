# services/ai/app/schemas/insights.py

**Purpose:** Response models for spending insights, anomalies and balances.

**Key contents:** Breakdown models (category, group, merchant), `PeriodComparison`, `InsightsSummary`, `Anomaly`, `AnomaliesResponse`, `Balance`, `BalancesResponse`.

**Depends on / used by:** `services/insights.py`, `services/balances.py`, `routes/insights.py`.

**Decisions & caveats:** Amounts are floats at the API boundary even though computation uses Decimal. `Balance.direction` is the string `owes_you` or `you_owe`, with `net_amount` always positive.
