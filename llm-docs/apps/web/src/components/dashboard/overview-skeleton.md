# apps/web/src/components/dashboard/overview-skeleton.tsx

**Purpose:** Route-level loading placeholder for the Overview page.

**Key contents:** `OverviewSkeleton` (headline, two-column ledger, groups and activity lists) and a private `ListRowsSkeleton`.

**Depends on / used by:** `@settle/ui` skeleton. Used by `app/dashboard/overview/loading.tsx`.

**Decisions & caveats:** Keep it in step with `dashboard/standing.tsx` and `overview-lists.tsx` (same container width and gaps) to avoid layout shift. The old shared skeletons (`StatSkeleton`, `ChartPanelSkeleton` and others) were removed in the 2026-11-01 dashboard rework; pages now use `FigureStripSkeleton` from `dashboard/panel.tsx` or their own local skeletons.
