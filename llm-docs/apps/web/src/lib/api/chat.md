# apps/web/src/lib/api/chat.ts

**Purpose:** Client for chat thread listing and deletion.

**Key contents:** `listChatThreads`, `deleteChatThread` (URL-encodes the id). Local `handleResponse` handles 204.

**Depends on / used by:** `lib/chat-types.ts`; `hooks/useChatThreads.ts`. Streaming chat itself goes through `/api/chat`, not here.

**Decisions & caveats:** Nothing notable.
