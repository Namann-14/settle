# apps/web/src/hooks/mutations/useRecurringMutations.ts

**Purpose:** Mutations for recurring expense rules and sync.

**Key contents:** `useCreateRecurring` (create then sync), `useUpdateRecurring`, `useDeleteRecurring`, and `useRecurringSync`; syncs invalidate balances when rows were created.

**Depends on / used by:** Uses `lib/api/recurring`, `todayIso`, `invalidate.ts`.

**Decisions & caveats:** Sync sends the user's local date (no cron job; see decisions.md). Update and delete only invalidate `recurring`, not spending, which is acceptable since sync, not edits, creates expenses.
