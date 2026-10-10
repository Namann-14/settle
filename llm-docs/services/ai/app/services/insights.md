# services/ai/app/services/insights.py

**Purpose:** Deterministic analytics over fetched expense dicts: summaries, period comparison, anomalies, top payer.

**Key contents:** `compute_summary` (totals by category/group/merchant, daily average, change vs the previous equal period), `detect_anomalies` (z-score outliers and duplicate-looking charges), `top_payer`, plus date-window helpers.

**Depends on / used by:** `schemas/insights`. Used by `routes/insights.py`; narratives are added by `chains/insights.py`.

**Decisions & caveats:** No LLM arithmetic by design: a wrong number is a bug here, never a hallucination. Decimal is used for sums. Soft-deleted expenses are excluded. This is group-amount based (full expense amount), distinct from the "user's own share" rule used by the api spending summary.
