# apps/web/src/app/dashboard/expenses/page.tsx

**Purpose:** Expenses route; renders `ExpensesPage` with server-prefetched data.

**Key contents:** Prefetches `serverQueries.expenses` with `limit: 100` and `date_from` = 30 days ago.

**Depends on / used by:** Uses `Prefetch`/`serverQueries` from `apps/web/src/lib/server-prefetch.tsx` and `components/expenses/expenses-page`.

**Decisions & caveats:** The 30-day default filter and UTC ISO date must match `ExpensesPage`'s client query so the React Query cache key hits; change both together.
