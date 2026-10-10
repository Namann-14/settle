# apps/web/src/app/api/ai/insights/group/[id]/route.ts

**Purpose:** Route handler for AI-generated insights about a group.

**Key contents:** `GET` forwards to `/insights/group/{id}` with an optional `days` query parameter.

**Depends on / used by:** `aiFetchJson`/`aiErrorResponse` in `src/lib/ai.ts` forward to `services/ai` (base from `AI_SERVICE_URL` and `AI_ROUTE_PREFIX`). Called from the web UI.

**Decisions & caveats:** Errors are mapped with `aiErrorResponse`.
