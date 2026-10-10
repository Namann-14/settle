# services/api/app/controllers/category.py

**Purpose:** Business rules for expense categories (system and per-user custom).

**Key contents:** `create_category`, `get_category`, `list_user_categories`, `update_category`, `delete_category`. Names must be unique per user, case-insensitively; system categories cannot be modified or deleted; users can only touch their own custom categories.

**Depends on / used by:** `repositories/category`, `schemas/category`, `controllers/exceptions`. Reused by the budget and recurring controllers to validate category access.

**Decisions & caveats:** Reading a system category is allowed for everyone, but custom categories are private. The case-insensitive uniqueness check here is the same rule that migration `5b1e0c7d9a21` applied retroactively to merge pre-existing duplicates.
