# apps/web/src/app/api/budgets/[id]/route.ts

**Purpose:** Next.js route handler that proxies deleting a budget to the backend API.

**Key contents:** `DELETE /budgets/{id}` returning 204.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Thin passthrough with no validation; auth and rules live in `services/api`.
