# apps/web/src/lib/api/expenses.ts

**Purpose:** Client for `/api/expenses`.

**Key contents:** `listExpenses` (builds query string from group_id, skip, limit, q, category_id, paid_by_id, date_from, date_to, scope), `getExpense`, `createExpense`, `updateExpense`, `deleteExpense`.

**Depends on / used by:** `types/expense.ts`; `hooks/useExpenses.ts`.

**Decisions & caveats:** Has its own copy of `handleResponse`. `scope=personal|group` was added with the personal tracker (decisions.md).
