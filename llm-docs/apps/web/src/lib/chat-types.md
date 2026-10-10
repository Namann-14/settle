# apps/web/src/lib/chat-types.ts

**Purpose:** Shared TypeScript types and a converter for the AI chat feature.

**Key contents:** `ChatMessage` (AI SDK `UIMessage` with `checkpointId` metadata and `suggestions` data part), `StoredPart`/`StoredMessage` mirroring `services/ai/app/db/chat_store.py`, `ChatThreadSummary`, `ChatThread`, and `toChatMessages` which rebuilds UI messages from stored history.

**Depends on / used by:** Used by the `/api/chat` route, the chat UI and `lib/api/chat.ts`.

**Decisions & caveats:** `toChatMessages` must produce exactly what `useChat` builds live so reloaded threads render identically; keep it in sync with the Python store shape. `checkpointId` is the LangGraph checkpoint used to fork on restore. Empty assistant messages are dropped.
