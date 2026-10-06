# services/api/app/routes/expenses.py

**Purpose:** HTTP routes for expenses.

**Key contents:** `POST /expenses`, `GET /expenses` (pagination, group_id, search, category, payer, date range and `scope=personal|group` filters), `GET/PATCH/DELETE /expenses/{id}`.

**Depends on / used by:** Delegates to `controllers/expense.py`; builds `ExpenseFilters` from `repositories/expense.py`.

**Decisions & caveats:** Limit is capped at 100. Update and delete are creator-only (controller). `scope` was added for the Expenses page 'Personal only / Groups only' filters.
