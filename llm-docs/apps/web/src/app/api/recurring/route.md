# apps/web/src/app/api/recurring/route.ts

**Purpose:** Next.js route handler that proxies recurring-expense rules to the backend API.

**Key contents:** `GET /recurring` (query forwarded) and `POST /recurring`.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** Recurring rules are personal-only in v1 (see `decisions.md`).
