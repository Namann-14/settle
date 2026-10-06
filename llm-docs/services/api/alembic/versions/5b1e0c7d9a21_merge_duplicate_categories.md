# services/api/alembic/versions/5b1e0c7d9a21_merge_duplicate_categories.py

**Purpose:** Data migration folding user-created categories that duplicate a system category into the system one.

**Key contents:** SQL that repoints `expenses`, `recurring_expenses` and `budgets` from each custom duplicate (case-insensitive name match) to the system category, then deletes the custom rows.

**Depends on / used by:** Revises `342fca98de7d`; followed by `7c3e9a41b2d8`.

**Decisions & caveats:** Irreversible: `downgrade()` is a no-op. If the user already budgets the system category, the duplicate's budget is deleted rather than moved, to respect the budget unique indexes. Rationale in decisions.md (Categories): duplicates split spending and budgets, and the AI categorizer needed system categories to match against.
