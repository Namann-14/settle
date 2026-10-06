# services/api/app/models/budget.py

**Purpose:** ORM model for standing monthly spending limits.

**Key contents:** `Budget` (amount Numeric(12,2), currency, user, nullable category). A null category means the overall budget.

**Depends on / used by:** `models/user`, `models/category`; `controllers/budget`, `controllers/spending`, migration `342fca98de7d`.

**Decisions & caveats:** Two partial unique indexes enforce one budget per (user, category) and one overall per user, because NULLs never collide in a plain unique index. Budgets are standing limits applied to every month, so there are no per-month rows.
