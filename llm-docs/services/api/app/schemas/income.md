# services/api/app/schemas/income.py

**Purpose:** Pydantic schemas for income.

**Key contents:** `IncomeCreate`, `IncomeUpdate`, `IncomeResponse`.

**Depends on / used by:** Used by `routes/incomes.py`, `controllers/income.py`.

**Decisions & caveats:** Currency optional; defaults to the user's default currency (controller).
