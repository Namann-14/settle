# apps/web/src/components/expenses/expenses-page.tsx

**Purpose:** All-expenses page: a filterable ledger of every expense the user is part of.

**Key contents:** `ExpensesPage` = `PageContainer` > `PageHeader` ("Expenses", "Add manually" secondary action) > `AiQuickAdd` > `FigureStrip` (your share, you paid, expense count for the current filters) > filter row (`SearchField`, `Segmented` date range, native pill selects for group/scope, category, payer) > ledger table. From `lg` the ledger is a 5-column grid (date, description with group / category / split metadata, paid by, amount, your share plus "you lent/borrowed"); below `lg` rows stack (description over date, payer, group, category; amount over impact). Each row is a button that opens the `ExpenseSheet` in edit mode. Also exports `myImpact`.

**Depends on / used by:** Uses `dashboard/panel.tsx` primitives, `useExpenses` and friends, `expense-sheet.tsx`, `ai-quick-add.tsx`; `myImpact` is imported by `groups/group-detail.tsx` (keep its name/signature).

**Decisions & caveats:** The group dropdown doubles as a scope filter: the pseudo-ids 'personal' and 'group' map to the API's `?scope=` param (see decisions.md). Fetch limit is 100 (the count figure says so when hit). Default range is 30 days and must match the route's prefetch key. Totals sum amounts as-is in the user's default currency (same simplification as before). `myImpact` is positive when the user lent (paid minus own share) and negative when owed. States: row-shaped skeleton, inline error with retry, one-line empty state that differs when filters are active; loaded rows fade in.
