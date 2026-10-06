# services/api/alembic/versions/342fca98de7d_expense_tracker.py

**Purpose:** Migration adding the personal expense tracker schema (2026-09-27).

**Key contents:** Creates `incomes` (indexed by user and date) and `budgets`; adds `icon` and `color` columns to `categories`; seeds 12 system categories (Food & Dining, Groceries, Transport, Rent, Utilities, Shopping, Entertainment, Travel, Health, Subscriptions, Education, Other) with a lucide icon and chart color token.

**Depends on / used by:** Revises `83be959c9e94`; followed by `5b1e0c7d9a21`. Models in `app/models/budget.py` and the income model mirror it.

**Decisions & caveats:** Budgets use two partial unique indexes (`uq_budget_user_category` where category is set, `uq_budget_user_overall` where null) so a user has one overall budget and at most one per category. The seed also updates existing system-named rows lacking an icon. Downgrade deletes the seeded system categories by name.
