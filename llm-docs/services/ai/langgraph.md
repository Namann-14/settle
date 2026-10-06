# services/ai/langgraph.json

**Purpose:** LangGraph Studio / server configuration for the AI service.

**Key contents:** Registers two graphs, `chat_agent` and `expense_extraction_agent`, pointing at their `graph.py` modules, and loads env from `.env`.

**Depends on / used by:** `app/agents/chat_agent/graph.py`, `app/agents/expense_extraction_agent/graph.py`, `pyproject.toml`.

**Decisions & caveats:** Graphs are imported without the FastAPI lifespan, which is why `api_client.get_http_client` creates its pool lazily.
