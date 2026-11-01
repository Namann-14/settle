# apps/web/src/app/dashboard/spending/layout.tsx

**Purpose:** Shared layout for the Spending section with its sub-page navigation.

**Key contents:** One `PageContainer` with `SpendingNav` above the child page.

**Depends on / used by:** Uses `PageContainer` from `components/dashboard/panel` and `components/spending/spending-nav`; wraps Overview, Budgets, Recurring and Categories pages, which render their own `PageHeader` and content as siblings in this column.

**Decisions & caveats:** The pill nav sits above each sub-page's `PageHeader` so the four pages read as tabs of one section while each title still names the page (Spending, Budgets, Recurring, Categories). Sub-pages must not wrap themselves in another `PageContainer`.
