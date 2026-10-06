# apps/web/src/app/api/incomes/[id]/route.ts

**Purpose:** Next.js route handler that proxies single-income requests to the backend API.

**Key contents:** `PATCH` and `DELETE /incomes/{id}`; delete returns 204.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Thin passthrough with no validation; auth and rules live in `services/api`.
