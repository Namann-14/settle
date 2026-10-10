# packages/ui/src/components/chart.tsx

**Purpose:** Recharts wrapper with theme-aware colors.

**Key contents:** `ChartContainer` (takes a `ChartConfig` of labels/colors/icons), `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`.

**Depends on / used by:** `recharts`; used by Spending charts.

**Decisions & caveats:** `ChartStyle` injects a `<style>` with per-series CSS variables for light and `.dark` themes, so series colors are referenced as `var(--color-<key>)`. Category colors stored as tokens like `chart-3` map onto the theme chart palette. Client component.
