# apps/web/src/app/api/budgets/route.ts

**Purpose:** Next.js route handler that proxies budget requests to the backend API.

**Key contents:** `GET /budgets` (query forwarded) and `PUT /budgets` (upsert of the overall or per-category monthly budget) to `services/api`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Uses `backendErrorResponse`, so backend status codes pass through. Budgets are standing monthly limits (see `decisions.md`).
