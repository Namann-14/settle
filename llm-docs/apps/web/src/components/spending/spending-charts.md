# apps/web/src/components/spending/spending-charts.tsx

**Purpose:** Recharts charts for the spending overview.

**Key contents:** Exports `DailySpendChart` (bar chart of daily spend) and `TrendChart` (multi-month trend) built from a `SpendingSummary`.

**Depends on / used by:** Uses recharts and lib/months; loaded only via `next/dynamic` in `spending-overview.tsx`.

**Decisions & caveats:** Recharts is heavy, so this module must stay behind dynamic import to protect bundle size.
