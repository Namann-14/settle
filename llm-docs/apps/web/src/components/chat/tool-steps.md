# apps/web/src/components/chat/tool-steps.ts

**Purpose:** Maps AI service tool names and raw tool I/O to human-friendly UI text.

**Key contents:** `toolStep(name)` returns icon plus active/done labels for the known chat tools (balances, spending summary, categories, expenses, groups, members, settlements) with a title-cased fallback; `readableArgs` and `outputLines` turn args/outputs into short lines with UUIDs removed.

**Depends on / used by:** Mirrors tools in `services/ai/app/tools`; used by `chat/assistant-message.tsx`.

**Decisions & caveats:** Tool outputs are plain text for the model (pipe-separated tables or one item per line with inline `x_id: <uuid>`), so `outputLines` depends on that format and will degrade gracefully, not fail, if it changes. New server tools (e.g. `get_budget_status`) are not in the map and fall back to the generic wrench label until added here.
