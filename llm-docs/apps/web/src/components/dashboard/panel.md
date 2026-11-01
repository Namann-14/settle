# apps/web/src/components/dashboard/panel.tsx

**Purpose:** The dashboard's shared page vocabulary; every signed-in page is built from it so headers, surfaces, figures, filters and buttons read the same everywhere.

**Key contents:** `PageContainer` (centered column, `narrow` for single-column pages), `PageHeader` (Inter 24px title, one line of context, actions), `Panel` + `PanelHeader` (flat bordered surface and its heading), `rowClass` (hairline-separated list rows), `FigureStrip` / `FigureStripSkeleton` (2-4 key figures in one ruled strip; serif only for money), `buttonClass` (pill buttons: primary, secondary, ghost, danger; md and sm), `Segmented` (filter radio track), `SegmentedNav` (same track as sub-page navigation), `SearchField`.

**Depends on / used by:** `@settle/ui` `cn`, Next `Link` with typed `Route`. Used by every dashboard page (overview, groups, spending, expenses, settlements, settings, chat home).

**Decisions & caveats:** Implements DESIGN.md "App page anatomy" (2026-11-01 dashboard rework). Replaced `Eyebrow` (uppercase labels) and the hover `.lift`; stat tiles became `FigureStrip`. Panels stay flat on hover. `buttonClass` sizes grow to 40/44px on phones for tap targets. Change these primitives rather than restyling pages one by one. On phones `FigureStrip` cells become compact label/value rows, and pill tracks hide their scrollbar. Type uses the named roles (`text-meta` descriptions and labels, `text-figure` money) with `text-pretty` on descriptions. `Segmented` follows the radio-group keyboard model: one Tab stop on the selected option, arrow keys move and select. Pill padding tightens on phones so four options fit at 375px.
