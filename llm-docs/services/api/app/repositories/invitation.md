# services/api/app/repositories/invitation.py

**Purpose:** Data access for group invitations.

**Key contents:** Find pending invite by group+email (expired rows included), get by id, list pending unexpired invites for a group, `list_pending_for_user` (the invitee's inbox: matches `invited_user_id` or email, skips deleted groups, eager-loads group and inviter), create (30-day TTL, random token, lowercased email, optional `invited_user_id`), `set_status` with optional deferred commit.

**Depends on / used by:** Uses `models/invitation.py`, `models/group.py`; called from `controllers/group.py`.

**Decisions & caveats:** Email comparisons are lowercased on both sides. `INVITE_TTL` is 30 days. `get_pending_invitation` deliberately returns expired PENDING rows because they still hold the unique index; the controller marks them EXPIRED before re-inviting. `set_status(commit=False)` lets callers fold the status change into a larger transaction.
