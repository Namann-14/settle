# apps/web/src/app/api/invitations/[id]/[action]/route.ts

**Purpose:** Next.js route handler that proxies accepting or declining an invite to the backend API.

**Key contents:** `POST /invitations/{id}/{action}` where action is `accept` or `decline`; anything else is a local 404.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by `useRespondToInvitation`.

**Decisions & caveats:** Accept returns the joined group as JSON; decline is a 204 from the api and is passed through as an empty 204. Errors go through `backendErrorResponse`.
