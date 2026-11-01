# apps/web/src/components/spending/states.tsx

**Purpose:** Shared loading, error, empty and link pieces for the Spending pages.

**Key contents:** `quietLinkClass` (the text action in a `PanelHeader`), `RowsSkeleton` (placeholders shaped like `rowClass` rows, optional icon), `PanelSkeleton` (rows or chart variant inside a `Panel`), `LoadError` (inline "Couldn't load X. Try again"), `EmptyLine` (one-line empty state).

**Depends on / used by:** Uses `Panel`/`rowClass` from `components/dashboard/panel`; used by every file in `components/spending` that renders a data region.

**Decisions & caveats:** Kept local to Spending instead of added to `panel.tsx` (shared file owned elsewhere). Mirrors the `RowsSkeleton`/`Retry` pattern in `dashboard/overview-lists.tsx`; `PanelSkeleton variant="chart"` replaces the old use of `ChartPanelSkeleton` from `overview-skeleton.tsx`.
