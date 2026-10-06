# services/api/app/models/invitation.py

**Purpose:** ORM model for email invitations to a group.

**Key contents:** `GroupInvitation` with email, unique URL-safe `token`, `expires_at`, `status` (InvitationStatus), group, inviter and optional invited_user FKs.

**Depends on / used by:** Used by `repositories/invitation.py`, `controllers/group.py` (claim on first sign-in via `routes/__init__.py`).

**Decisions & caveats:** A partial unique index allows only one PENDING invite per (group, email), so re-inviting is possible after cancel/expire. `invited_user_id` is null until the invitee has an account. Email matching elsewhere is case-insensitive.
