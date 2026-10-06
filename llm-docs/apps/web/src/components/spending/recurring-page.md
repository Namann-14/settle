# apps/web/src/components/spending/recurring-page.tsx

**Purpose:** Recurring tab: lists rules, shows an estimated monthly cost and allows pause/resume.

**Key contents:** Lists rules from `useRecurring` with category icons, frequency descriptions and pause/play toggles via `useUpdateRecurring`; opens `RecurringDialog`.

**Depends on / used by:** Uses lib/frequency, lib/balances, category data.

**Decisions & caveats:** The 'per month' headline uses rough conversion factors (`PER_MONTH`: daily 30.44, weekly 4.345), so it is an estimate and ignores currency differences.
