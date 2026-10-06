# services/ai/app/tools/groups.py

**Purpose:** Chat tools for groups and their members.

**Key contents:** `list_my_groups` (name, id, currency) and `get_group_members` (names, ids, roles).

**Depends on / used by:** `services/context`, `core/errors`. Registered in `tools/__init__.py`.

**Decisions & caveats:** Removed members (`removed_at` set) are filtered out. `list_my_groups` is documented as the required first step before using any group_id.
