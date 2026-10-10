# apps/web/src/components/dashboard/this-month-card.tsx

**Purpose:** Overview strip showing this month's spending against the overall budget.

**Key contents:** `ThisMonthCard` reads `useSpendingSummary`; shows a `BudgetBar` with pace marker, amount left/over, % change vs last month, or a personal/group split prompt when no budget is set. Links to Spending.

**Depends on / used by:** Uses `spending/budget-bar`, `@/lib/months`, `@/lib/balances`, `@/lib/people`.

**Decisions & caveats:** Implements the personal-tracker 'my spending = own share' rule and budget display from decisions.md. Month change is hidden when last month's total is zero.
