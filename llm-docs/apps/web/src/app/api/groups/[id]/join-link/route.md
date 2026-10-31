# apps/web/src/app/api/groups/[id]/join-link/route.ts

**Purpose:** Next.js route handler that proxies a group's join link to the backend API.

**Key contents:** `GET /groups/{id}/join-link` (created on first request) and `POST` (reset, admins only).

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by `useJoinLink` / `useResetJoinLink`.

**Decisions & caveats:** Thin passthrough; errors go through `backendErrorResponse` so the api status and `detail` reach the client.
