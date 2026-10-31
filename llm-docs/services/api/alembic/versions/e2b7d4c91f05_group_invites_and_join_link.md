# services/api/alembic/versions/e2b7d4c91f05_group_invites_and_join_link.py

**Purpose:** Schema for consent-based group invites and shareable join links.

**Key contents:** Adds `DECLINED` to the `invitation_status` enum; adds nullable `groups.join_code` (String 32) with unique constraint `uq_groups_join_code`.

**Depends on / used by:** Revises `a4f1c8d2e6b3`. Used by `models/group.py`, `db/enums.InvitationStatus` and `controllers/group.py`.

**Decisions & caveats:** `ALTER TYPE ... ADD VALUE` runs in an autocommit block because Postgres refuses it inside a transaction. Postgres can't drop an enum value, so downgrade only rewrites DECLINED rows to CANCELLED and leaves the value in the type.
