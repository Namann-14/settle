# apps/web/src/hooks/useIncomes.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useIncomes(params?)` lists incomes for an optional date range/limit, key `["incomes", params]`.

**Depends on / used by:** `lib/api/incomes.ts`; Spending page Income/Spent/Saved figures.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load').
