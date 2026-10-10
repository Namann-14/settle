# services/ai/app/prompts/insights.py

**Purpose:** Prompts for narrating precomputed insights.

**Key contents:** `INSIGHTS_NARRATIVE_SYSTEM` and `ANOMALY_NARRATIVE_SYSTEM`.

**Depends on / used by:** Used by chains/insights.

**Decisions & caveats:** Both forbid recomputing or adding numbers, so the LLM only narrates. Unlike others, they do not use the shared IDENTITY block.
