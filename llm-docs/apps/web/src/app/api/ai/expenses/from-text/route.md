# apps/web/src/app/api/ai/expenses/from-text/route.ts

**Purpose:** Route handler that turns free text into an expense draft via the AI service.

**Key contents:** `POST` forwards the JSON body to `/expenses/from-text` and returns an `ExpenseDraft`.

**Depends on / used by:** `aiFetchJson`/`aiErrorResponse` in `src/lib/ai.ts` forward to `services/ai` (base from `AI_SERVICE_URL` and `AI_ROUTE_PREFIX`). Called from the web UI.

**Decisions & caveats:** Errors are mapped with `aiErrorResponse`.
