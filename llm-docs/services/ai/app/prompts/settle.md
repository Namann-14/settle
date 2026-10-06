# services/ai/app/prompts/settle.py

**Purpose:** Prompts for settle-up plan copy and group insight.

**Key contents:** `SETTLE_PLAN_SYSTEM` (headline plus reminders for incoming payments only) and `GROUP_INSIGHT_SYSTEM`.

**Depends on / used by:** Used by chains/settle.

**Decisions & caveats:** Reminders must use the exact `amount_display` provided and avoid emoji and payment links; amounts are never recomputed by the model.
