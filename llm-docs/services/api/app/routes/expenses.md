# services/api/app/routes/expenses.py

**Purpose:** HTTP routes for expenses.

**Key contents:** `POST /expenses`, `GET /expenses` (pagination, group_id, search, category, payer, date range `scope=personal|group` filters, and `include_group_expenses`), `GET/PATCH/DELETE /expenses/{id}`.

**Depends on / used by:** Delegates to `controllers/expense.py`; builds `ExpenseFilters` from `repositories/expense.py`.

**Decisions & caveats:** Limit is capped at 100. Update and delete are creator-only (controller). `scope` was added for the Expenses page 'Personal only / Groups only' filters. `include_group_expenses=true` widens the no-group listing to every expense in the user's active groups, even ones they aren't part of; only the search palette sends it, so the Expenses page keeps its 'involves me' scope.
