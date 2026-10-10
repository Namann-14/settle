# services/api/app/schemas/group_member.py

**Purpose:** Pydantic schemas for group members.

**Key contents:** `GroupMemberCreate`, `GroupMemberUpdate`, `GroupMemberResponse` (includes `user_name` and `user_email`).

**Depends on / used by:** Used by `routes/groups.py`, `repositories/group.py`, `schemas/group.py`, `schemas/invitation.py`.

**Decisions & caveats:** `user_name`/`user_email` come from properties on the ORM model via `from_attributes`.
