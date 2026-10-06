# services/api/app/schemas/category.py

**Purpose:** Pydantic schemas for categories.

**Key contents:** `CategoryCreate`, `CategoryUpdate`, `CategoryResponse` with name, icon and color limits.

**Depends on / used by:** Used by `routes/categories.py`, `repositories/category.py`.

**Decisions & caveats:** `CategoryCreate` accepts `is_system` and `user_id`, so the controller must override them for end-user requests.
