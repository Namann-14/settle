# apps/web/src/components/expenses/expenses-page.tsx

**Purpose:** All-expenses page with filters, search and totals.

**Key contents:** `ExpensesPage` filters by search text (deferred), group/scope, category, payer, and date range; lists expenses with the user's impact; hosts `AiQuickAdd` and the `ExpenseSheet`. Also exports `myImpact`.

**Depends on / used by:** Uses `useExpenses` and friends, `expense-sheet.tsx`, `ai-quick-add.tsx`; `myImpact` is imported by `groups/group-detail.tsx`.

**Decisions & caveats:** The group dropdown doubles as a scope filter: the pseudo-ids 'personal' and 'group' map to the API's `?scope=` param (see decisions.md). Fetch limit is 100. `myImpact` is positive when the user lent (paid minus own share) and negative when owed.
