# services/api/app/repositories/spending.py

**Purpose:** Read queries behind the spending tracker.

**Key contents:** `SplitRow` dataclass and `split_rows` (user's split rows for a date window joined to expense and category, with a merchant-or-description label), `budgets_with_categories` (eager-loaded), and `income_total` for one currency.

**Depends on / used by:** Used by `controllers/spending.py`; reads `ExpenseSplit`, `Expense`, `Category`, `Budget`, `Income`.

**Decisions & caveats:** 'Spending' is the user's own `amount_owed` share across personal and group expenses (decisions.md). Deliberately one query for the whole window, aggregated in Python by the caller, because DB round trips to remote Neon dominate latency (about 10 queries cut to 3). Excludes soft-deleted expenses.
