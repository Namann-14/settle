# apps/web/src/hooks/mutations/useIncomeMutations.ts

**Purpose:** Mutations for income entries.

**Key contents:** `useCreateIncome`, `useUpdateIncome`, `useDeleteIncome` built on a shared `useIncomeMutation` that invalidates `incomes` and spending.

**Depends on / used by:** Uses `lib/api/incomes`; used by `income-dialog.tsx`.

**Decisions & caveats:** Nothing notable.
