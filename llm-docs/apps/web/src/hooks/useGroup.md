# apps/web/src/hooks/useGroup.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useGroup(id)`, `useGroupBalances(id)` (disabled while id is undefined) and `useGroupInvitations(id)`.

**Depends on / used by:** `lib/api/groups.ts`; group detail pages.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load').
