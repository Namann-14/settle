# apps/web/src/components/dashboard/chart-cards.tsx

**Purpose:** Client wrappers that lazy-load the recharts-based cards.

**Key contents:** Exports `SpendChartCard` and `CostAnalysisCard` as `next/dynamic` imports with `ssr: false` and skeleton fallbacks.

**Depends on / used by:** Wraps `spend-chart-card.tsx` and `cost-analysis-card.tsx`; skeletons from `overview-skeleton.tsx`. Used by the overview page.

**Decisions & caveats:** `ssr: false` is only allowed in a Client Component, hence this file instead of dynamic imports in the Server Component page. It keeps recharts out of the initial bundle (see the site-load decision in decisions.md).
