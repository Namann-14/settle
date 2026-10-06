# apps/web/src/app/api/ai/expenses/from-voice/route.ts

**Purpose:** Route handler that turns a voice recording into an expense draft.

**Key contents:** `POST` forwards a multipart body to `/expenses/from-voice` and returns an `ExpenseDraft`.

**Depends on / used by:** `aiFetchJson`/`aiErrorResponse` in `src/lib/ai.ts` forward to `services/ai` (base from `AI_SERVICE_URL` and `AI_ROUTE_PREFIX`). Called from the web UI.

**Decisions & caveats:** Raw multipart passthrough: the body is forwarded as bytes with its original content-type and boundary rather than re-encoded. Returns 400 if the request is not `multipart/form-data`.
