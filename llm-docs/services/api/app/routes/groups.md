# services/api/app/routes/groups.py

**Purpose:** HTTP routes for groups, members, invitations and balances.

**Key contents:** Group CRUD, add/remove members, invite by email, list/cancel invitations, and `GET /groups/{id}/balances`.

**Depends on / used by:** Delegates to `controllers/group.py`; schemas in `schemas/group*.py`, `schemas/invitation.py`, `schemas/balances.py`.

**Decisions & caveats:** Inviting an existing user adds them immediately (`status: added`); unknown emails get a pending invite claimed at first sign-in. Removing a member is refused while they have an unsettled balance. `AddMemberRequest` is defined inline in this file.
