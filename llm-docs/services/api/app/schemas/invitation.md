# services/api/app/schemas/invitation.py

**Purpose:** Pydantic schemas for group invitations.

**Key contents:** `InviteMemberRequest` (validated email, role), `InvitationResponse`, `InviteMemberResponse` (status `added` or `invited` plus member or invitation), `InvitationList`.

**Depends on / used by:** Used by `routes/groups.py`.

**Decisions & caveats:** The response shape is a discriminated-by-`status` union so the client knows whether the person joined immediately.
