# apps/web/src/app/api/invitations/route.ts

**Purpose:** Next.js route handler that proxies the current user's invite inbox to the backend API.

**Key contents:** `GET /invitations`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by `useMyInvitations`.

**Decisions & caveats:** Thin passthrough; errors go through `backendErrorResponse`.
