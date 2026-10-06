# services/api/app/models/group.py

**Purpose:** ORM model for an expense-sharing group.

**Key contents:** `Group` with name, description, `default_currency`, soft-delete `deleted_at`, creator FK. Relationships to members, expenses, settlements, invitations, recurring expenses.

**Depends on / used by:** Used by `repositories/group.py`, `models/group_member.py`, `models/expense.py`, `models/settlement.py`.

**Decisions & caveats:** Soft-deleted via `deleted_at`. Members and invitations cascade with the group, but expenses and settlements have no ORM cascade (DB-level FK cascade only).
