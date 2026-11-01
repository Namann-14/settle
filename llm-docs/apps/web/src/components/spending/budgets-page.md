# apps/web/src/components/spending/budgets-page.tsx

**Purpose:** Budgets tab of the Spending section.

**Key contents:** `PageHeader` ("Budgets", month and reset note), a three-cell `FigureStrip` (overall budget, spent so far, category budgets total), an "Overall" panel and a "By category" panel of `BudgetRow`s. Each row has an editable limit, a `BudgetBar` and save/remove via `useUpsertBudget`/`useDeleteBudget`.

**Depends on / used by:** Uses `useBudgets`, `useCategories`, `useSpendingSummary`, lib/months, `components/dashboard/panel` and `./states`; sibling of the other spending pages.

**Decisions & caveats:** Budgets are standing monthly limits (no per-month rows); lookup map keys by `category_id ?? "overall"`. Spent amounts come from the summary, so only the user's own share counts. "Spent so far" turns Oxblood only when over the overall budget. Rows stack (name and bar, then amount field and action) below `sm`. Loading and error cover budgets and categories; a failed summary just shows zero spent.
