# apps/web/src/app/api/recurring/sync/route.ts

**Purpose:** Next.js route handler that proxies the recurring sync call to the backend API.

**Key contents:** `POST /recurring/sync` with the client's local date in the body.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by client hooks/server prefetch in `apps/web`.

**Decisions & caveats:** The dashboard calls this once per session instead of a cron job. The backend is idempotent (`FOR UPDATE SKIP LOCKED`) and rejects a client date more than one day from server time.
