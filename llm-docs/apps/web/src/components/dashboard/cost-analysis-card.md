# apps/web/src/components/dashboard/cost-analysis-card.tsx

**Purpose:** 'By category' card showing this month's spending split by category.

**Key contents:** `CostAnalysisCard` reads `useSpendingSummary`, builds percentage segments with `categoryColor`, renders a stacked bar and legend list with a link to the Spending page.

**Depends on / used by:** Uses `useSpendingSummary`, `spending/category-icon`, `@/lib/balances`, `@/lib/people` (`num`). Lazy-loaded via `chart-cards.tsx`.

**Decisions & caveats:** Amounts are the user's own share (personal expenses plus their split of group expenses), not full bill amounts, per the spending decision. Only default-currency totals are included.
