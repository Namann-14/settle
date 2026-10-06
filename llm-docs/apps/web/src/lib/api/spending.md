# apps/web/src/lib/api/spending.ts

**Purpose:** Client for the monthly spending summary.

**Key contents:** `getSpendingSummary(month?, trendMonths?)` hitting `/api/spending/summary` with `month` and `trend_months`.

**Depends on / used by:** `types/spending.ts`; `hooks/useSpendingSummary.ts`.

**Decisions & caveats:** Note the hook does not pass `trendMonths`, so the server default applies.
