# apps/web/src/components/expenses/expense-sheet.tsx

**Purpose:** Slide-over form to create, edit or review (AI draft) an expense, including split setup.

**Key contents:** `ExpenseSheet` wraps `ExpenseForm`, keyed by seed (create/draft/edit). Handles group/personal, payer, categories, currency, equal/exact/percentage splits, unresolved AI-detected names, delete, and a 'Repeats' option for personal expenses. Helpers `equalShares`, `centsOff` (distance in whole cents) and `formatPct`.

**Depends on / used by:** Uses `forms/field.tsx`, `useGroup` (members), `useGroups` (picker), mutations (`useCreateExpense`, `useUpdateExpense`, `useDeleteExpense`, `useCreateRecurring`), `@/lib/frequency`, `@/types`. Opened from `expenses-page.tsx` and `groups/group-detail.tsx`.

**Decisions & caveats:** Members come from `useGroup(groupId, { refetchOnMount: "always" })`, not the cached groups list: that list could predate someone joining, which left new members out of the split. In create mode, members that appear after the refetch are ticked too (tracked in a `seenMembers` ref). Switching split type clears typed values and the error, since they mean amounts for one type and percentages for the other. Sum checks compare whole cents (`centsOff`) because floats like 33.33 * 3 aren't exact; the api recomputes EQUAL/PERCENTAGE amounts anyway. Repeats creates a recurring rule instead of an expense (personal, non-edit only); the sync then logs the first occurrence. Editing is gated to the creator (`canEdit`). The `key` on the form resets state per seed.
