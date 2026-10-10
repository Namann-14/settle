# services/api/app/routes/__init__.py

**Purpose:** Shared route plumbing: error translation and the current-user dependency.

**Key contents:** `handle_controller_errors` context manager mapping controller exceptions to HTTP 404/403/400/409, and `get_current_db_user`, which resolves the Clerk-authenticated user to the local `User`.

**Depends on / used by:** Imported by every router module in `routes/`; uses `controllers/*`, `dependencies/auth.py`, `repositories/user.py`, `services/clerk.py`.

**Decisions & caveats:** On first sight (or if the stored user has no email) it pulls email and name from Clerk and syncs the user, then claims pending group invitations, so members can be invited by email. `fetch_clerk_profile` failures return (None, None) so auth never fails on profile sync.
