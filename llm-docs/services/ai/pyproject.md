# services/ai/pyproject.toml

**Purpose:** Python project definition and dependencies for the AI service.

**Key contents:** Package `ai` (Python >=3.11) depending on FastAPI, LangChain/LangGraph 1.x, `langchain-groq` and `groq`, `langgraph-checkpoint-postgres` with `psycopg[binary,pool]`, httpx, pydantic-settings, uvicorn. Built with hatchling, wheel packages `["app"]`. An `eval` dependency group (pytest) and pytest config (`testpaths = ["evals"]`) back the evals.

**Depends on / used by:** `langgraph.json`, `app/` code. The README it references is `services/ai/README.md`.

**Decisions & caveats:** LangChain and LangGraph are pinned to major versions (<2) to avoid API breaks. Postgres checkpointing shares the main database, which is why api's Alembic `env.py` ignores unmodelled tables. Requires Python 3.11+ while api uses 3.12. Eval deps are a named group, not `dev`, so a default install (Vercel) never pulls them; run evals with `uv run --group eval`. The langsmith pytest plugin comes with the `langsmith` runtime dep.
