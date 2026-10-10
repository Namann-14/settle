# apps/web/src/lib/queryClient.ts

**Purpose:** Factory for the React Query client.

**Key contents:** `getQueryClient()`: new client per server render, singleton in the browser. Defaults: staleTime 5 min, gcTime 10 min, retry 1, no refetch on window focus, refetch on reconnect.

**Depends on / used by:** Used by `providers/query-provider.tsx`. `server-prefetch.tsx` builds its own client with matching staleTime.

**Decisions & caveats:** The server prefetch client's staleTime must match the 5 min here so hydrated data is not immediately refetched. A shared singleton on the server would leak data between users, hence per-call creation.
