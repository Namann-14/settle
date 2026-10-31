# services/api/app/repositories/expense.py

**Purpose:** Data access for expenses, including filtering and split replacement.

**Key contents:** `ExpenseFilters` dataclass (text search, category, payer, date range, scope personal/group) applied by `_apply_filters`; get by id, user/group paginated lists, an unpaginated group list for balance math, create (with splits), update, delete (soft by default).

**Depends on / used by:** Uses `models/expense.py`, `models/expense_split.py`; used by `controllers/expense.py`, `routes/expenses.py` (builds filters).

**Decisions & caveats:** A user's expense list matches paid-by, created-by or any split containing the user, using an outer join plus `DISTINCT`. Updating `splits` replaces them through the relationship (`expense.splits.clear()`, flush, append): a bulk `delete()` left the eagerly loaded splits marked deleted and every split edit crashed with "Instance has been deleted". The flush is needed because (expense_id, user_id) is unique. Soft delete sets `deleted_at`; reads exclude deleted unless asked. `scope` was added for the personal/group filter (decisions.md).
