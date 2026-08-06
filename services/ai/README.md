# AI Service

LangChain / LangGraph agents backing Settle's AI features:

- **chat_agent** — conversational assistant with tool access to group/expense data (`ChatConversation`, `ChatMessage`).
- **expense_extraction_agent** — turns a receipt image, free text, or voice transcript into an `AIExpenseDraft`.

## Layout

```
app/
  agents/        one subpackage per LangGraph agent (graph.py, state.py, nodes.py, tools.py)
  chains/        simple LCEL chains that don't need graph control flow
  llm/           chat model client factories
  prompts/       prompt templates
  routes/        FastAPI routers exposing agents to the API service
  services/      glue logic (persisting drafts, calling back into services/api)
  schemas/       pydantic request/response models
  tools/         tools shared across agents
  db/            AI-service-local persistence, if any
  core/config.py settings (model keys, LangSmith)
langgraph.json   LangGraph CLI / platform config
```

## LangSmith

Tracing is enabled via env vars in `.env` (see `.env.example`):
`LANGCHAIN_TRACING_V2`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`.
