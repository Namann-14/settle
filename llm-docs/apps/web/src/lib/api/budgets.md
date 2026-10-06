# apps/web/src/lib/api/budgets.ts

**Purpose:** Client for `/api/budgets`.

**Key contents:** `listBudgets`, `upsertBudget` (PUT), `deleteBudget`, built on `request` from `http.ts`.

**Depends on / used by:** `types/budget.ts`; Spending > Budgets tab.

**Decisions & caveats:** Budgets are upserted by category (null category means the overall budget); one per user/category per decisions.md, so PUT rather than POST.
