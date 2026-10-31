# apps/web/src/app/api/categories/route.ts

**Purpose:** Next.js route handler that proxies category list and creation to the backend API.

**Key contents:** `GET /categories` and `POST /categories`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Errors go through `backendErrorResponse`, keeping the api status and `detail` (it used to turn every api 400 into a 500).
