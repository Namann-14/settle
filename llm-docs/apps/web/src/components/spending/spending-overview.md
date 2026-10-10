# apps/web/src/components/spending/spending-overview.tsx

**Purpose:** Main Spending overview: monthly stats, budget alerts, breakdowns, charts, transactions and income.

**Key contents:** Month-navigable view of `useSpendingSummary`: income/spent/saved stats, `BudgetAlerts`, `CategoryBreakdown`, `TopMerchants`, dynamic charts, `MonthTransactions` and `IncomeList`, plus AI quick-add and expense sheet.

**Depends on / used by:** Uses many hooks, `budget-bar`, `income-dialog`, expenses components, lib/months; charts via `spending-charts.tsx`.

**Decisions & caveats:** Spending is the user's own share only and only in `default_currency`; other currencies appear separately (decisions.md). Charts are dynamically imported. The largest component here; transactions fetch up to 100 expenses for the month.
