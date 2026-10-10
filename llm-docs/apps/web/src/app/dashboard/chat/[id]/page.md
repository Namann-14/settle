# apps/web/src/app/dashboard/chat/[id]/page.tsx

**Purpose:** Server page for one AI chat thread; loads saved messages and renders the chat panel.

**Key contents:** `loadMessages` fetches `/chat/threads/:id` from the AI service and converts it with `toChatMessages`. Reads optional `?q` as an initial prompt and renders `ChatPanel` keyed by id.

**Depends on / used by:** Uses `@/lib/ai`, `@/lib/chat-types`, `components/chat/chat-panel`. Reached via `dashboard/chat/page.tsx` redirect.

**Decisions & caveats:** A 404 from the AI service is treated as an empty thread: the thread is only created on first message, and someone else's thread also returns 404, so it is never continued. `key={id}` resets panel state when switching chats.
