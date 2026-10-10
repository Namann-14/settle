# services/ai/app/tools/__init__.py

**Purpose:** Exports the tool list for the chat agent.

**Key contents:** `CHAT_TOOLS`: expense list/detail, group list/members, categories, settlements, balances, spending summary, budget status.

**Depends on / used by:** Sibling tool modules; consumed by `agents/chat_agent`.

**Decisions & caveats:** All tools are read-only; adding a write tool here would let the agent mutate data, so it is a deliberate boundary.
