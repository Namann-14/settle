# apps/web/src/app/api/groups/[id]/members/[memberId]/route.ts

**Purpose:** Next.js route handler that proxies removing a group member to the backend API.

**Key contents:** `DELETE /groups/{id}/members/{memberId}` returning 204.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Thin passthrough with no validation; auth and rules live in `services/api`.
