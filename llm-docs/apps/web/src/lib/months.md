# apps/web/src/lib/months.ts

**Purpose:** Month-string utilities for the spending tracker.

**Key contents:** `currentMonth`, `isMonth`, `shiftMonth`, `monthBounds`, `monthLabel`, `monthProgress` (0..1, used for the budget 'should be here' tick).

**Depends on / used by:** Spending pages and `useSpendingSummary`; matches the API's `?month=YYYY-MM`.

**Decisions & caveats:** Months are `YYYY-MM` strings on the user's local calendar, not UTC. String comparison is used for ordering.
