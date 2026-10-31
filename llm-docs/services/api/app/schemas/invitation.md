# services/api/app/schemas/invitation.py

**Purpose:** Pydantic schemas for group invitations and join links.

**Key contents:** `InviteMemberRequest` (validated email only), `InvitationResponse` (plus `group_name`, `invited_by_name` for the inbox), `InviteMemberResponse` (always `status: "invited"` plus the invitation), `InvitationList`, `JoinLinkResponse` (`code`), `JoinPreviewResponse` (group id, name, description, member count, `already_member`).

**Depends on / used by:** Used by `routes/groups.py` and `routes/invitations.py`.

**Decisions & caveats:** The request has no `role`: invitees always join as MEMBER, so a member can't mint admins. `status` stays on the invite response (fixed to `invited`) so the client shape is unchanged now that nobody is added straight away.
