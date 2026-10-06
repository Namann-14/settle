# services/api/app/models/group_member.py

**Purpose:** ORM model linking users to groups with a role.

**Key contents:** `GroupMember` with group_id, user_id, `role` (GroupRole, default MEMBER), `removed_at`. Unique per (group, user). Convenience properties `user_name` and `user_email` read from the related user.

**Depends on / used by:** Used by `repositories/group.py`, `schemas/group_member.py` (response reads the properties via `from_attributes`).

**Decisions & caveats:** Membership removal is soft (`removed_at`); re-adding reuses the row and clears `removed_at` (see `repositories/group.py`). Queries must filter `removed_at IS NULL`. The `user_name` properties trigger a lazy load unless the user is eager-loaded.
