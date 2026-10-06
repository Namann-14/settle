# apps/web/src/types/recurring.ts

**Purpose:** Types for recurring expenses.

**Key contents:** `Frequency` (DAILY, WEEKLY, MONTHLY, YEARLY), `RecurringExpense`, create/update payloads, `RecurringSyncResult`.

**Depends on / used by:** `lib/api/recurring.ts`, `lib/frequency.ts`.

**Decisions & caveats:** `next_run_date` is server-managed. Monthly/yearly rules clamp to month end; personal only in v1.
