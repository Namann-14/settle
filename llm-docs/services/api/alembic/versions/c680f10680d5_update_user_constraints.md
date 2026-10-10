# services/api/alembic/versions/c680f10680d5_update_user_constraints.py

**Purpose:** Makes `users.email` nullable.

**Key contents:** A single `alter_column` on `users.email` with a symmetric downgrade.

**Depends on / used by:** Revises `9d7aa4d2dc38`; followed by `83be959c9e94`.

**Decisions & caveats:** Nullable email accommodates Clerk accounts that have no email address.
