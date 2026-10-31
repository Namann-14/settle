# apps/web/src/app/api/settlements/route.ts

**Purpose:** Next.js route handler that proxies settlement list and creation to the backend API.

**Key contents:** `GET /settlements` (query forwarded) and `POST /settlements`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Errors go through `backendErrorResponse`, keeping the api status and `detail` (it used to turn every api 400 into a 500).
