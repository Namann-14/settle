# services/api/app/controllers/user.py

**Purpose:** Business logic for syncing Clerk users into the local database and managing profiles.

**Key contents:** `sync_user` (create if new, otherwise update email/name without overwriting an existing email with None), `get_current_user_profile`, `update_profile` (rejects an email already used by another user).

**Depends on / used by:** `repositories/user`, `schemas/user`. Used by `routes/users.py`.

**Decisions & caveats:** Email is nullable (migration `c680f10680d5`), so a missing email from Clerk must not clobber a stored one.
