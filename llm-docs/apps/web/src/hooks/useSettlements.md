# apps/web/src/hooks/useSettlements.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useSettlements(params?)` lists settlements, key `["settlements", params]`.

**Depends on / used by:** `lib/api/settlements.ts`; balances computed in `lib/balances.ts`.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load').
