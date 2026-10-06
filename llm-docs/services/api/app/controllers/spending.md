# services/api/app/controllers/spending.py

**Purpose:** Builds the monthly "my spending" summary used by the dashboard, Telegram `/month`, and the AI `get_spending_summary` tool.

**Key contents:** `get_summary(db, user, month, trend_months=6)` aggregates the user's split rows over a trend window into monthly totals, daily series, top merchants, by-category (with icon/color), personal vs group share, budgets (overall and per category), income, and other-currency totals. Helpers parse and shift months.

**Depends on / used by:** `repositories/spending`, `schemas/spending`. Used by `routes/spending.py`, `controllers/telegram.py`, and indirectly services/ai.

**Decisions & caveats:** Spending is the user's own share (`amount_owed`), per decisions.md. Only the user's default currency is totalled; other currencies are reported separately and never converted. Deliberately three queries (splits, budgets, income) with Python aggregation, a performance fix (about 10 queries down to 3). Budgeted categories with no spend still appear.
