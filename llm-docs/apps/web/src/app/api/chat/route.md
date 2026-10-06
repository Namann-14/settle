# apps/web/src/app/api/chat/route.ts

**Purpose:** Chat endpoint that bridges the AI service's SSE stream into the Vercel AI SDK UI message stream.

**Key contents:** `POST` takes `{id, messages}`, sends only the latest user message plus `conversation_id` and optional `checkpoint_id` to `/chat/stream`, then translates events (reasoning, text delta, tool call/result, checkpoint, suggestions) into UI stream parts for `useChat`.

**Depends on / used by:** Uses `aiFetch` and `aiErrorStatus` from `src/lib/ai.ts` and `ChatMessage` from `src/lib/chat-types.ts`. Upstream is `services/ai/app/routes/chat.py`.

**Decisions & caveats:** The chat id doubles as the LangGraph thread id, so memory is server-side and only the newest message is sent. The checkpoint id from the last assistant message lets the server fork after a client-side "Restore checkpoint". Only one text or reasoning part is open at a time, keeping parts in stream order. Request abort is propagated through `signal`.
