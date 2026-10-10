# services/api/app/models/settlement.py

**Purpose:** ORM model for a payment between two users that settles debt.

**Key contents:** `Settlement` with amount, currency, note, date, optional group, and paid_by / received_by / created_by FKs. Check constraint that payer and receiver differ; index on group_id.

**Depends on / used by:** Used by `repositories/settlement.py`, `services/balances.py`.

**Decisions & caveats:** `group_id` NULL means a direct friend-to-friend settlement. Settlements are hard-deleted (no `deleted_at`).
