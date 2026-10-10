# services/api/app/controllers/__init__.py

**Purpose:** Re-exports the controller functions and domain exceptions for convenient import.

**Key contents:** Category, expense, group, settlement and user controller functions plus the exception hierarchy, with an `__all__` list.

**Depends on / used by:** The sibling controller modules; routes import from here or from specific modules.

**Decisions & caveats:** Incomplete as an index: budget, income, recurring, spending and telegram controllers are not re-exported and are imported by module path.
