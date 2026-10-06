# apps/web/src/app/api/ai/settlements/plan/route.ts

**Purpose:** Route handler that asks the AI service for a settle-up plan.

**Key contents:** `POST` forwards the body (empty object if none) to `/settlements/plan` and returns a `SettlePlan`.

**Depends on / used by:** `aiFetchJson`/`aiErrorResponse` in `src/lib/ai.ts` forward to `services/ai` (base from `AI_SERVICE_URL` and `AI_ROUTE_PREFIX`). Called from the web UI.

**Decisions & caveats:** Errors are mapped with `aiErrorResponse`.
