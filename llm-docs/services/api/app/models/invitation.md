# services/api/app/models/invitation.py

**Purpose:** ORM model for email invitations to a group.

**Key contents:** `GroupInvitation` with email, unique URL-safe `token`, `expires_at`, `status` (InvitationStatus), group, inviter and optional invited_user FKs. `group_name` and `invited_by_name` properties feed `InvitationResponse` for the invitee's inbox.

**Depends on / used by:** Used by `repositories/invitation.py`, `controllers/group.py`, `schemas/invitation.py`.

**Decisions & caveats:** A partial unique index allows only one PENDING invite per (group, email), so re-inviting is possible after cancel/decline/expire. `invited_user_id` is set at invite time when the email already has an account, otherwise when the invitee answers. Email matching elsewhere is case-insensitive. The name properties need the `group`/`invited_by` relationships loaded (the inbox query eager-loads them).
