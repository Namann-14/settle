# apps/web/src/components/spending/budget-bar.tsx

**Purpose:** Spent-vs-budget progress bar.

**Key contents:** Exports `WARN_AT` (0.8), `budgetState` (ratio and ok/warn/over/none level) and `BudgetBar` with an optional pace tick.

**Depends on / used by:** Used by `budgets-page.tsx`, `spending-overview.tsx` and `dashboard/this-month-card.tsx`.

**Decisions & caveats:** Warns at 80%, Oxblood when over, tick showing expected month progress. Colours are tokens only: the category colour (or primary) while on track, `destructive/60` when warning, `destructive` when over (was amber, a non-token hue; see decisions.md "2026-11-01 Spending pages re-composed"). No width transition. A null or zero budget yields level `none`.
