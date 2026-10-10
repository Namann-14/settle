# apps/web/src/app/api/chat/threads/route.ts

**Purpose:** Lists the user's chat threads.

**Key contents:** `GET` calls the AI service's `/chat/threads` and returns the `threads` array.

**Depends on / used by:** `aiFetchJson`/`aiErrorResponse` in `src/lib/ai.ts` forward to `services/ai` (base from `AI_SERVICE_URL` and `AI_ROUTE_PREFIX`).

**Decisions & caveats:** Errors are mapped with `aiErrorStatus`.
