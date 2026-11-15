# services/ai/evals/test_tool_routing.py

**Purpose:** Offline eval of the chat agent's first tool choice.

**Key contents:** One parametrized test per case in `data/tool_routing_cases.json`, marked `@pytest.mark.langsmith(test_suite_name="settle-tool-routing")`. Runs one model step with `CHAT_SYSTEM` and `CHAT_TOOLS` bound, and checks the first tool call (or no call) against the allowed list, plus expected args when a case sets them.

**Depends on / used by:** `app.llm.client.get_chat_model`, `app.prompts.chat.CHAT_SYSTEM`, `app.tools.CHAT_TOOLS`, `evals.cases`.

**Decisions & caveats:** Only the first step runs, so no services/api, Clerk token or seeded data is needed; it tests routing, not tool results. Mirrors `chat_agent/nodes.call_model` but with a fixed date; if that node's prompt assembly changes, update this test to match.
