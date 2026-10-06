# services/ai/app/routes/insights.py

**Purpose:** Read-only analytics routes: spending summary, anomaly detection, balances, and per-group insight.

**Key contents:** `GET /insights/summary?days=`, `GET /insights/anomalies?days=`, `GET /balances`, `GET /insights/group/{group_id}`. Each fetches data through the token-scoped `ApiClient`, computes numbers with `services/insights.py` or `services/balances.py`, then asks a chain to narrate.

**Depends on / used by:** `chains/insights`, `chains/settle`, `services/balances`, `services/insights`, `services/context`, `schemas/insights|settle`.

**Decisions & caveats:** All arithmetic is plain Python (Decimal); the LLM only writes the narrative and never computes figures. Anomaly detection is rule-based (z-score outliers, duplicate-looking charges), not ML. Balances are derived here from expenses and settlements because services/api has no balances endpoint for the cross-group view. Summaries pull up to the capped expense list (see `api_client.list_all_expenses`).
