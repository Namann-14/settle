# services/api/app/routes/groups.py

**Purpose:** HTTP routes for groups, members, invitations, join links and balances.

**Key contents:** Group CRUD, add/remove members, invite by email, list/cancel invitations, `GET /groups/{id}/balances`, `GET|POST /groups/join/{code}` (preview, join), `GET|POST /groups/{id}/join-link` (get, admin reset).

**Depends on / used by:** Delegates to `controllers/group.py`; schemas in `schemas/group*.py`, `schemas/invitation.py` (`JoinLinkResponse`, `JoinPreviewResponse`), `schemas/balances.py`.

**Decisions & caveats:** `/join/{code}` is registered before `/{group_id}` so "join" isn't parsed as a group id. Inviting always returns a pending invite (`status: invited`); nobody joins until they accept. Removing a member is refused while they have an unsettled balance. `AddMemberRequest` is defined inline in this file.
