# apps/web/src/lib/server-prefetch.tsx

**Purpose:** Server-side prefetching of dashboard data into the React Query cache (decisions.md, 'Faster first load').

**Key contents:** `serverQueries` (query definitions mirroring client hooks) and the async `Prefetch` component that starts queries without awaiting them and wraps children in `HydrationBoundary` with pending queries dehydrated as promises. Calls `connection()` so pages render per request.

**Depends on / used by:** Uses `lib/backend.ts`; mirrors `src/hooks/*`; used by dashboard page server components.

**Decisions & caveats:** Query keys must match the hooks exactly or prefetched data is ignored. Failed server queries are redacted and refetched by the client. Not awaiting lets HTML stream immediately; on the Overview this cut browser API calls from about 8 to 1. `server-only` import prevents client bundling. Per-user data, so no static rendering.
