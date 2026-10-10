# apps/web/src/components/spending/income-dialog.tsx

**Purpose:** Dialog to create, edit or delete an income entry.

**Key contents:** `IncomeDialog` with an `IncomeSeed` (create/edit, null closes) and an inner form for source, amount, currency, date and notes.

**Depends on / used by:** Uses income mutations, `useCurrentUser` (default currency), forms/field helpers; opened from `spending-overview.tsx`.

**Decisions & caveats:** Currency defaults to the user's default currency. Income is separate from expenses so balances and splits are unaffected.
