# apps/web/src/components/spending/spending-overview.tsx

**Purpose:** Main Spending page: the month's figures, budget alerts, breakdowns, charts, transactions and income.

**Key contents:** `PageHeader` ("Spending", Add income / Add expense), `AiQuickAdd`, then a `MonthStepper` (prev / month / next links in the pill track) scoping a `FigureStrip` (spent, budget left or "Not set", income, saved/overspent) with a personal-vs-group note, `BudgetAlerts`, and a three-column grid on `lg`: daily chart + `CategoryBreakdown`, `MonthTransactions` + (`TopMerchants`, `IncomeList`), six-month trend. Opens `ExpenseSheet` and `IncomeDialog`.

**Depends on / used by:** Uses many hooks, `budget-bar`, `income-dialog`, `./states`, expenses components, lib/months; charts via `spending-charts.tsx`.

**Decisions & caveats:** Spending is the user's own share only and only in `default_currency`; other currencies appear separately (decisions.md). Charts are dynamically imported with a chart-shaped `PanelSkeleton`. Every region has a skeleton, an inline retry and a one-line empty state. Budget alerts sit in a plain bordered strip; over-budget lines are Oxblood, warnings plain text. The month stepper sits above the figures (not after them) because it scopes the whole page. Transactions fetch up to 100 expenses for the month. The Spent figure only shows a % change for completed months; for the current month it shows last month's total instead, since a partial month against a full one read as -100% on the 1st.
