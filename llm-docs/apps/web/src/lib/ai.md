# apps/web/src/lib/ai.ts

**Purpose:** Server-only helper used by Next route handlers to call the Python AI service with the user's Clerk token.

**Key contents:** `aiFetch` (returns raw Response so SSE streams pass through), `aiFetchJson`, `AiServiceError`, `aiErrorStatus` and `aiErrorResponse` (maps errors to `{message}` JSON). Reads `AI_SERVICE_URL` (default http://localhost:8001) and `AI_ROUTE_PREFIX`.

**Depends on / used by:** Mirror of `lib/backend.ts` for services/ai; used by `app/api/ai/*` and `app/api/chat/*` route handlers; browser code calls those routes via `lib/api/ai.ts` and `lib/api/chat.ts`.

**Decisions & caveats:** `AI_SERVICE_URL` may end with `/` on Vercel (service binding), so trailing slashes are stripped. `AI_ROUTE_PREFIX` is `/ai` on Vercel and empty locally. 4xx statuses are preserved and FastAPI `detail`/`detail.reason` is surfaced; everything else becomes 502. Requests use `cache: no-store`. Throws 401 if no Clerk token.
