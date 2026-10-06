# services/ai/app/schemas/settle.py

**Purpose:** Models for the settle-up plan and per-group insight.

**Key contents:** `SettlePlanRequest`, `PlannedTransfer` (with direction incoming/outgoing/others and optional reminder text), `SettlePlan` (headline plus transfers), `TopPayer`, `GroupInsight`.

**Depends on / used by:** `routes/settlements.py`, `routes/insights.py`, `chains/settle`.

**Decisions & caveats:** `PlannedTransfer.index` ties LLM-written reminders back to the right transfer. Omitting `group_id` in the request means "only my own transfers across all groups".
