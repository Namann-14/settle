# services/ai/evals/data/tool_routing_cases.json

**Purpose:** Chat questions with the acceptable first tool (the `settle-tool-routing` LangSmith dataset).

**Key contents:** A shared `context` (Asha, INR, today 2026-10-20) and 15 cases covering balances, spending, budgets, expenses, groups, categories and settlements, plus greetings that should call no tool. `tools` lists acceptable first tools (empty means none). Optional `args` pins arguments, e.g. September resolves to `month: "2026-09"`.

**Depends on / used by:** `test_tool_routing.py`.

**Decisions & caveats:** Group-scoped questions expect `list_my_groups` first because the prompt forbids guessing a group_id. Tool names must match `app/tools`; renaming a tool means updating this file.
