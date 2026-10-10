# services/api/app/repositories/invitation.py

**Purpose:** Data access for group invitations.

**Key contents:** Find pending invite by group+email, get by id, list pending unexpired invites for a group or an email, create (30-day TTL, random token, lowercased email), `set_status` with optional deferred commit.

**Depends on / used by:** Uses `models/invitation.py`; called from `controllers/group.py`.

**Decisions & caveats:** Email comparisons are lowercased on both sides. `INVITE_TTL` is 30 days. `set_status(commit=False)` lets callers fold the status change into a larger transaction.
