# apps/web/src/app/api/groups/[id]/members/route.ts

**Purpose:** Next.js route handler that proxies adding a group member to the backend API.

**Key contents:** `POST /groups/{id}/members`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Errors go through `backendErrorResponse`, keeping the api status and `detail` (it used to turn every api 400 into a 500).
