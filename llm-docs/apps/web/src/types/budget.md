# apps/web/src/types/budget.ts

**Purpose:** Types for budgets.

**Key contents:** `Budget`, `UpsertBudgetPayload`. `category_id: null` means the overall monthly budget.

**Depends on / used by:** `lib/api/budgets.ts`.

**Decisions & caveats:** Amounts are decimal strings. One overall budget and at most one per category (decisions.md).
