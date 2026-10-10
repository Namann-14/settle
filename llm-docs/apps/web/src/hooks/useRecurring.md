# apps/web/src/hooks/useRecurring.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useRecurring` lists recurring expense rules, key `recurring`.

**Depends on / used by:** `lib/api/recurring.ts`; Spending > Recurring tab.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load').
