# apps/web/src/app/api/chat/threads/[id]/restore/route.ts

**Purpose:** Restore a chat to an earlier reply, rolling back expenses the assistant added after it.

**Key contents:** `POST` takes `{checkpointId}` and forwards it to the ai service's `POST /chat/threads/{id}/restore`, returning `{removed_expenses}`.

**Depends on / used by:** `aiFetch` / `aiErrorStatus` from `lib/ai.ts`. Called by `restoreChatCheckpoint` in `lib/api/chat.ts`.

**Decisions & caveats:** The graph fork still happens on the next message, which carries the same checkpoint id. This call handles the data and history, so the rollback doesn't wait for the user to type again.
