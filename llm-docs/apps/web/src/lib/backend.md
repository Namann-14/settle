# apps/web/src/lib/backend.ts

**Purpose:** Server-only helper for Next route handlers and server components to call the Python FastAPI backend with the Clerk token.

**Key contents:** `backendFetch<T>(path, init)` (adds Bearer token, `cache: no-store`, handles 204), `BackendError`, and `backendErrorResponse` which converts errors to `{message}` JSON preserving status and FastAPI `detail`. Reads `BACKEND_URL` (default http://localhost:8000).

**Depends on / used by:** Used by `app/api/**` route handlers and `lib/server-prefetch.tsx`; sibling of `lib/ai.ts`.

**Decisions & caveats:** Trailing slashes in `BACKEND_URL` are stripped because the Vercel service binding may add one. Plain `Error('Unauthorized')` maps to 401. Preserving `detail` lets the UI show messages like 'Settle this member's balance first'.
