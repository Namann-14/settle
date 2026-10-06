# services/api/app/repositories/__init__.py

**Purpose:** Package init re-exporting the core repository functions.

**Key contents:** Re-exports user, category, expense, group/member and settlement functions with an `__all__`.

**Depends on / used by:** Imported by controllers.

**Decisions & caveats:** Only a subset: budget, income, invitation, recurring, spending and telegram repositories are not re-exported and must be imported from their modules directly.
