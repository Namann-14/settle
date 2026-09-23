# AI Service

Stateless LLM compute layer backing Settle's AI features. It never touches
Postgres directly — tools call `services/api` over HTTP, forwarding the
caller's Clerk bearer token, so api's existing controllers do all permission
enforcement.

## Features

| Feature | Endpoint |
|---|---|
| Smart categorization | `POST /expenses/categorize` |
| Natural-language expense entry | `POST /expenses/from-text` |
| Receipt scanning | `POST /expenses/from-receipt` (see Known gaps) |
| Voice entry | `POST /expenses/from-voice` |
| Ask-your-expenses chat | `POST /chat`, `POST /chat/stream`, `GET /chat/conversations/{id}` |
| Spend insights / anomalies | `GET /insights/summary`, `GET /insights/anomalies` |
| Balances | `GET /balances` (api has no balances endpoint of its own) |

`/expenses/*` never create an expense — they return a draft; the frontend
confirms/edits it and POSTs to `services/api` itself.

## Layout

```
app/
  agents/        one subpackage per LangGraph agent
    chat_agent/             hand-built StateGraph: call_model + ToolNode, tool loop
    expense_extraction_agent/  Studio-visible demo of the extraction pipeline
                            (routes call app/chains/extraction.py directly instead)
  chains/        LCEL chains: categorize, extraction, insights narration
  llm/           model client factories (chat/extraction/whisper), receipt OCR seam
  prompts/       system prompt templates
  routes/        FastAPI routers + the bearer-token auth dependency (deps.py)
  services/      api_client.py (httpx client), context.py (the token seam),
                 balances.py / insights.py (pure compute), participants.py,
                 draft_builder.py
  schemas/       pydantic request/response models
  tools/         LangChain tools the chat agent calls (wrap services/api + the
                 pure compute services)
  core/          config.py (settings), errors.py
langgraph.json   LangGraph CLI / Studio config
```

## Auth

`services/ai` has no Clerk secret of its own — `require_bearer_token`
(`app/routes/deps.py`) only checks the header looks like a bearer token, then
forwards it opaquely. Every route calls `GET /users/me` on `services/api`
first (via `build_request_context`), which both validates the token and
supplies profile fields — so there's no route that produces data without an
api round-trip rejecting a bad token.

## Token flow into tools

The bearer token travels via LangGraph's `context_schema` (`RequestContext`),
**never** via graph state — state is checkpointed, and persisting a Clerk
token there would replay a stale token on later turns. Tools declare
`runtime: ToolRuntime[RequestContext, dict]` to read it; that parameter is
stripped from the schema the model sees.

## LangSmith

Tracing is enabled via env vars in `.env` (see `.env.example`):
`LANGSMITH_TRACING`, `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`. (The installed
`langchain-core` version only recognizes the legacy `LANGCHAIN_TRACING_V2`
name for the actual runtime check — if tracing silently stops working after a
dependency bump, set both `LANGSMITH_*` and `LANGCHAIN_*` again.)

## Known gaps

1. **Receipt OCR is unavailable.** The Groq account this service runs
   against has no vision-capable model (verified live). `POST
   /expenses/from-receipt` returns a 501 with `{capability, reason, remedy}`.
   The receipt-text → draft half of the pipeline is fully built — enabling a
   provider later (`app/llm/vision.py`) is a config change, not a feature
   build.
2. **Chat persistence needs `DATABASE_URL`.** With it, chat memory is a
   Postgres LangGraph checkpointer and display history lives in
   `ai_chat_threads` / `ai_chat_messages` (`app/db/`), both created on
   startup. Without it, chats fall back to in-process memory (lost on
   restart, single worker only) and the history endpoints return nothing.
3. **Draft history isn't durably persisted.** `services/api`'s
   `ai_expense_drafts` table stays unused, as do its `chat_conversations` /
   `chat_messages` tables — chat history is owned by this service instead,
   next to the checkpoints it has to stay consistent with.
4. **Participant name resolution** depends on `GroupMemberResponse.user_name`
   / `user_email` (added to `services/api` alongside this service). On an
   unpatched `services/api`, everyone but the speaker resolves to
   `"unresolved"` — still a safe, shippable UX; the frontend shows a member
   picker to confirm.
5. **No rate limiting** on this service.
6. **Single-currency balances/insights.** Cross-currency conversion isn't
   wired up; mixed-currency ledgers will under/overstate totals.
