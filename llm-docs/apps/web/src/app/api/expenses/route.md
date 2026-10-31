# apps/web/src/app/api/expenses/route.ts

**Purpose:** Next.js route handler that proxies expense list and creation to the backend API.

**Key contents:** `GET /expenses` (query string forwarded, including `scope=personal|group`) and `POST /expenses`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Errors go through `backendErrorResponse`, keeping the api status and `detail` (it used to turn every api 400 into a 500).
