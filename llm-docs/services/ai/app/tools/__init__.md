# services/ai/app/tools/__init__.py

**Purpose:** Exports the tool list for the chat agent.

**Key contents:** `CHAT_TOOLS`: expense list/detail, group list/members, categories, settlements, balances, spending summary, budget status, and `add_expense` (the only write).

**Depends on / used by:** Sibling tool modules; consumed by `agents/chat_agent`.

**Decisions & caveats:** Read tools run freely. A write tool must pause for the user's approval with a LangGraph `interrupt()` before writing (see `expense_actions.py`), and record what it created so checkpoint restore can undo it.
