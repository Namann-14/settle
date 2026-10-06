# services/api/app/controllers/income.py

**Purpose:** CRUD for the minimal income records that feed the savings figure on the Spending page.

**Key contents:** `list_incomes` (date range, limit), `create_income`, `update_income`, `delete_income`, with an `_owned` ownership guard.

**Depends on / used by:** `repositories/income`, `schemas/income`, `models/income`. Called from `routes/incomes.py`.

**Decisions & caveats:** Income is deliberately separate from expenses so balances and splits stay untouched. In updates an explicit null clears `notes` but is ignored for other fields.
