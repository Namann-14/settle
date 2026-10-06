# services/api/app/models/category.py

**Purpose:** ORM model for expense categories, both system-wide and per-user custom ones.

**Key contents:** `Category` with name, `is_system`, optional lucide `icon` and chart `color` token, and nullable `user_id` (null = system category). Unique on (name, user_id). Relationships to expenses, recurring expenses and budgets (budgets cascade-delete).

**Depends on / used by:** Used by `models/expense.py`, `models/recurring_expense.py`, `models/budget.py`, `repositories/category.py`, `repositories/spending.py`.

**Decisions & caveats:** A unique constraint on (name, user_id) does not collide for system rows since NULL user_id never matches in Postgres, so duplicate system names are not DB-enforced. Custom categories that duplicated a system name were merged into it by migration `5b1e0c7d9a21` (irreversible); see decisions.md. Seeded system categories (12) give the AI categorizer something to match against.
