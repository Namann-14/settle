# apps/web/src/app/api/health/route.ts

**Purpose:** Simple health probe that checks the backend is reachable.

**Key contents:** `GET` fetches `http://localhost:8000/health` with no cache and relays the result, or a 500 if unreachable.

**Depends on / used by:** Targets `services/api`'s `/health`.

**Decisions & caveats:** The URL is hard-coded to localhost and ignores `BACKEND_URL`, so in production it only reports on a local backend and will fail. Does not use `backendFetch` or authentication.
