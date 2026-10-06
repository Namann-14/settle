# services/api/app/controllers/settlement.py

**Purpose:** Business logic for settlements (payments recorded between two users, optionally within a group).

**Key contents:** `create_settlement` (amount must be positive, no self-settlement, both users must exist and belong to the group if one is given), `get_settlement`, `list_user_settlements`, `update_settlement`, `delete_settlement`.

**Depends on / used by:** `repositories/group|settlement|user`, `schemas/settlement`. Used by `routes/settlements.py`; settlement data feeds group balances.

**Decisions & caveats:** Settlements are treated as ledger entries that reduce nets in balance calculation, so edits/deletes change group balances.
