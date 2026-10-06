# services/api/alembic/versions/9d7aa4d2dc38_create_users_table.py

**Purpose:** First migration: creates the `users` table.

**Key contents:** Columns `clerk_user_id` (unique index), `email` (unique), `name`, `id` UUID, timestamps.

**Depends on / used by:** Root of the revision chain (no parent); followed by `c680f10680d5`.

**Decisions & caveats:** Users are keyed by Clerk id; the app does not store passwords.
