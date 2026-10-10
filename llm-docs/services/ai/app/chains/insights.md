# services/ai/app/chains/insights.py

**Purpose:** LLM narration of precomputed spending summaries and anomalies.

**Key contents:** `narrate_summary(dict)` and `narrate_anomalies(list)`; both are prompt | model | string parser chains with low temperature.

**Depends on / used by:** Uses prompts/insights, llm/client. Called by routes/insights.py.

**Decisions & caveats:** The model only narrates numbers computed elsewhere; prompts forbid adding or recomputing figures. Empty anomaly lists short-circuit without an LLM call.
