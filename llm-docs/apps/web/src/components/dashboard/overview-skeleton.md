# apps/web/src/components/dashboard/overview-skeleton.tsx

**Purpose:** Skeleton placeholders shaped like the overview cards.

**Key contents:** Exports `StatSkeleton`, `ChartPanelSkeleton`, `CategoryPanelSkeleton`, `ListRowsSkeleton`, `TableRowsSkeleton` and the full-page `OverviewSkeleton`.

**Depends on / used by:** Used by `app/dashboard/overview/loading.tsx`, `spending/spending-overview.tsx`, the dashboard cards and `groups/groups-page.tsx`.

**Decisions & caveats:** Keep dimensions in sync with the real cards to avoid layout shift. Serves both route-level loading and per-card data loading.
