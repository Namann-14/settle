# services/ai/app/chains/settle.py

**Purpose:** LLM-written copy for settle-up plans and group insights.

**Key contents:** `write_plan_copy(payload)` returns a headline plus WhatsApp-style reminders keyed by payment index; a second chain narrates group stats.

**Depends on / used by:** Uses prompts/settle, llm/client. Called by routes/settlements.py.

**Decisions & caveats:** Best-effort: on LLM failure plan copy returns (None, {}) so the caller falls back to templated text; the numbers never depend on the LLM.
