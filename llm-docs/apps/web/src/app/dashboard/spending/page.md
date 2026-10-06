# apps/web/src/app/dashboard/spending/page.tsx

**Purpose:** Spending overview tab for a chosen month.

**Key contents:** Validates `?month` (falls back to current month), prefetches that month's summary, expenses and incomes, renders `SpendingOverview`.

**Depends on / used by:** Uses `lib/months` (`isMonth`, `monthBounds`, `currentMonth`), `apps/web/src/lib/server-prefetch.tsx`.

**Decisions & caveats:** Spending means the user's own share, and only the user's default currency is totaled (decisions.md). Invalid month params silently fall back to the current month.
