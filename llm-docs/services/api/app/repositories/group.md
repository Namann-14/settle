# services/api/app/repositories/group.py

**Purpose:** Data access for groups and group membership.

**Key contents:** Get group (eager-loading members and users), list a user's active groups, create (auto-adds creator as ADMIN), update, soft delete; `get_group_by_join_code` (non-deleted only), `set_join_code` (new `secrets.token_urlsafe(12)`); add/update/remove/list members.

**Depends on / used by:** Uses `models/group.py`, `models/group_member.py`; called from `controllers/group.py` and `controllers/expense.py`.

**Decisions & caveats:** `add_group_member` revives a previously removed member by clearing `removed_at` and resetting the role instead of inserting a duplicate. Member removal is soft by default. `set_join_code` both creates and resets a link; the old code simply stops matching.
