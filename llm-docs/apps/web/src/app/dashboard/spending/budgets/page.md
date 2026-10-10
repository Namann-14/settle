# apps/web/src/app/dashboard/spending/budgets/page.tsx

**Purpose:** Budgets tab of the Spending section.

**Key contents:** Prefetches budgets and the current month's spending summary, renders `BudgetsPage`.

**Depends on / used by:** Uses `lib/months`, `apps/web/src/lib/server-prefetch.tsx`, `components/spending/budgets-page`.

**Decisions & caveats:** Budgets are standing monthly limits (one overall plus one per category), compared against the current month's summary (decisions.md).
