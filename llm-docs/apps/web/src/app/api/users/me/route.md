# apps/web/src/app/api/users/me/route.ts

**Purpose:** Next.js route handler that proxies the current user profile to the backend API.

**Key contents:** `GET` and `PATCH /users/me`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Uses the older inline error handling: any failure becomes a 500 (only "Unauthorized" maps to 401), so backend status codes such as 404 or 422 are lost. Newer routes use `backendErrorResponse`.
