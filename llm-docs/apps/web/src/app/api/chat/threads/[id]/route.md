# apps/web/src/app/api/chat/threads/[id]/route.ts

**Purpose:** Deletes a chat thread.

**Key contents:** `DELETE` calls the AI service's `/chat/threads/{id}` (id URL-encoded) and returns 204.

**Depends on / used by:** `aiFetchJson`/`aiErrorResponse` in `src/lib/ai.ts` forward to `services/ai` (base from `AI_SERVICE_URL` and `AI_ROUTE_PREFIX`).

**Decisions & caveats:** Errors are mapped with `aiErrorStatus`.
