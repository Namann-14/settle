# apps/web/src/components/spending/recurring-page.tsx

**Purpose:** Recurring tab: lists rules, shows an estimated monthly cost and allows pause/resume.

**Key contents:** `PageHeader` ("Recurring", "New recurring" action), a `FigureStrip` (about per month, active, paused or ended; only shown when rules exist) and an "All recurring" panel of rows. Each row opens `RecurringDialog`; a ghost pill pauses or resumes via `useUpdateRecurring`.

**Depends on / used by:** Uses lib/frequency, lib/balances, category data, `components/dashboard/panel` and `./states`.

**Decisions & caveats:** The per-month figure uses rough conversion factors (`PER_MONTH`: daily 30.44, weekly 4.345) and counts only active rules in the default currency, so it is an estimate. Inactive rows are muted rather than faded.
