# apps/web/src/components/dashboard/spend-chart-card.tsx

**Purpose:** Bar chart of group expenses vs settlements over 7/30/90 days.

**Key contents:** `SpendChartCard` buckets expenses and settlements by day, with a period toggle, recharts BarChart via `@settle/ui` chart wrapper, and a total in the header.

**Depends on / used by:** Uses recharts, `useExpenses`, `useSettlements`, `useCurrentUser`. Loaded only through `chart-cards.tsx`.

**Decisions & caveats:** Uses full bill amounts (group expenses), not the user's share, unlike the category card. Limited to the latest 100 rows, and the total sums only expenses in the user's default currency label even if rows are mixed-currency (no conversion). Import via chart-cards, not directly, to keep recharts lazy.
