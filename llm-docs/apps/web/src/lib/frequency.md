# apps/web/src/lib/frequency.ts

**Purpose:** Display helpers for recurring-expense frequency.

**Key contents:** `FREQUENCY_LABELS` and `describeFrequency(frequency, interval)` ('Monthly' or 'Every 3 weeks').

**Depends on / used by:** `types/recurring.ts`; Recurring UI and expense form 'Repeats' option.

**Decisions & caveats:** Pluralization is naive but intervals above 1 are always plural, so it is fine.
