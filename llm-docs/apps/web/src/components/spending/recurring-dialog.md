# apps/web/src/components/spending/recurring-dialog.tsx

**Purpose:** Dialog to create, edit or delete a recurring expense rule.

**Key contents:** `RecurringDialog` with a `RecurringSeed` and a form for description, amount, currency, category, frequency, interval and start/end dates.

**Depends on / used by:** Uses recurring mutations, `useCategories`, `lib/frequency`; used by `recurring-page.tsx`.

**Decisions & caveats:** Recurring rules are personal only in v1 (decisions.md). Creating a rule triggers a sync so a rule starting today appears immediately.
