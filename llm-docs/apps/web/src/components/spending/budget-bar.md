# apps/web/src/components/spending/budget-bar.tsx

**Purpose:** Spent-vs-budget progress bar.

**Key contents:** Exports `WARN_AT` (0.8), `budgetState` (ratio and ok/warn/over/none level) and `BudgetBar` with an optional pace tick.

**Depends on / used by:** Used by `budgets-page.tsx` and `spending-overview.tsx`.

**Decisions & caveats:** Implements the decision in decisions.md: amber at 80%, red when over, tick showing expected month progress. A null or zero budget yields level `none`.
