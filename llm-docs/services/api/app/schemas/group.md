# services/api/app/schemas/group.py

**Purpose:** Pydantic schemas for groups.

**Key contents:** `GroupCreate`, `GroupUpdate`, `GroupResponse` (includes members).

**Depends on / used by:** Used by `routes/groups.py`, `repositories/group.py`.

**Decisions & caveats:** `created_by_id` on create is overridden by the authenticated user in the controller.
