# services/api/app/routes/invitations.py

**Purpose:** The current user's group-invite inbox.

**Key contents:** `GET /invitations` (pending, unexpired invites addressed to the user), `POST /invitations/{id}/accept` (joins, returns `GroupResponse`), `POST /invitations/{id}/decline` (204).

**Depends on / used by:** Delegates to `controllers/group.py` (`list_my_invitations`, `respond_to_invitation`); schemas from `schemas/group.py` and `schemas/invitation.py`. Included by `app/main.py`; proxied by web `app/api/invitations/**`.

**Decisions & caveats:** Invites match by user id or email, so someone invited before they had an account sees it after signing up. Answering an invite not addressed to you returns 404, not 403, so invite ids aren't confirmed to outsiders.
