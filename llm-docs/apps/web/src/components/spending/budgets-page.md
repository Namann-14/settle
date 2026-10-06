# apps/web/src/components/spending/budgets-page.tsx

**Purpose:** Budgets tab of the Spending section.

**Key contents:** Lists the overall budget and one row per category, each with an editable limit, a `BudgetBar` and save/delete via `useUpsertBudget`/`useDeleteBudget`.

**Depends on / used by:** Uses `useBudgets`, `useCategories`, `useSpendingSummary`, lib/months; sibling of the other spending pages.

**Decisions & caveats:** Budgets are standing monthly limits (no per-month rows); lookup map keys by `category_id ?? "overall"`. Spent amounts come from the summary, so only the user's own share counts.
