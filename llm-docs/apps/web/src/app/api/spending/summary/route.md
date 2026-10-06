# apps/web/src/app/api/spending/summary/route.ts

**Purpose:** Next.js route handler that proxies the spending summary to the backend API.

**Key contents:** `GET /spending/summary` with the query string forwarded.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Spending means the user's own share, and only the default currency is totalled (see `decisions.md`).
