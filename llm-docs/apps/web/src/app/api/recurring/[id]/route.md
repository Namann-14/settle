# apps/web/src/app/api/recurring/[id]/route.ts

**Purpose:** Next.js route handler that proxies single recurring rule to the backend API.

**Key contents:** `PATCH` and `DELETE /recurring/{id}`; delete returns 204.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Deleting a rule keeps the expenses it already created. Resuming a paused rule skips missed occurrences.
