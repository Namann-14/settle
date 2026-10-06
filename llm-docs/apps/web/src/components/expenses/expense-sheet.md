# apps/web/src/components/expenses/expense-sheet.tsx

**Purpose:** Slide-over form to create, edit or review (AI draft) an expense, including split setup.

**Key contents:** `ExpenseSheet` wraps `ExpenseForm`, keyed by seed (create/draft/edit). Handles group/personal, payer, categories, currency, equal/exact/percentage splits, unresolved AI-detected names, delete, and a 'Repeats' option for personal expenses.

**Depends on / used by:** Uses `forms/field.tsx`, mutations (`useCreateExpense`, `useUpdateExpense`, `useDeleteExpense`, `useCreateRecurring`), `@/lib/frequency`, `@/types`. Opened from `expenses-page.tsx` and `groups/group-detail.tsx`.

**Decisions & caveats:** Splits are made cent-exact: equal shares let the first person absorb rounding, percentage splits let the last person do so. Unequal/percentage totals must match within 0.01. Repeats creates a recurring rule instead of an expense (personal, non-edit only); the sync then logs the first occurrence. Only current group members can hold a split. Editing is gated to the creator (`canEdit`). The `key` on the form resets state per seed.
