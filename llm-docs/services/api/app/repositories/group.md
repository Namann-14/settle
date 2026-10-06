# services/api/app/repositories/group.py

**Purpose:** Data access for groups and group membership.

**Key contents:** Get group (eager-loading members and users), list a user's active groups, create (auto-adds creator as ADMIN), update, soft delete; add/update/remove/list members.

**Depends on / used by:** Uses `models/group.py`, `models/group_member.py`; called from `controllers/group.py`.

**Decisions & caveats:** `add_group_member` revives a previously removed member by clearing `removed_at` and resetting the role instead of inserting a duplicate. Member removal is soft by default.
