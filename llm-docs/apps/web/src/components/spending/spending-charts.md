# apps/web/src/components/spending/spending-charts.tsx

**Purpose:** Recharts charts for the spending overview.

**Key contents:** Exports `DailySpendChart` (bars for every day of the month) and `TrendChart` (six-month trend), each in a `Panel` built from a `SpendingSummary`.

**Depends on / used by:** Uses recharts and lib/months; loaded only via `next/dynamic` in `spending-overview.tsx`.

**Decisions & caveats:** Recharts is heavy, so this module must stay behind dynamic import to protect bundle size. Quiet by design: both series use `--chart-1`, faint horizontal grid only, no y axis, no gradient, bar grow-in animation off (`isAnimationActive={false}`); the panel fades in once when it replaces its skeleton.
