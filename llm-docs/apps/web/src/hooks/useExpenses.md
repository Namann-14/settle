# apps/web/src/hooks/useExpenses.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useExpenses(params?)` lists expenses, key `["expenses", params]`. Params include group, search, category, payer, dates and `scope` (personal|group).

**Depends on / used by:** `lib/api/expenses.ts`, `ListExpensesParams`.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load'). The params object is part of the key, so key shape must be identical on server and client.
