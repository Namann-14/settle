# services/ai/app/prompts/chat.py

**Purpose:** System prompt for the chat agent.

**Key contents:** `CHAT_SYSTEM` with user name, default currency, money and date rules, and a tool policy.

**Depends on / used by:** Used by agents/chat_agent/nodes.

**Decisions & caveats:** Tool policy: never state a number not obtained from a tool; use get_spending_summary / get_budget_status (user's own share, per decisions.md); call list_my_groups before using any group_id; do not blindly retry failing tools.
