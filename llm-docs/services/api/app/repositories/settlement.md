# services/api/app/repositories/settlement.py

**Purpose:** Data access for settlements.

**Key contents:** Get by id, paginated group and user lists, an unpaginated group list for balance math, create, update, delete.

**Depends on / used by:** Uses `models/settlement.py`; called from `controllers/settlement.py` and the group balances flow.

**Decisions & caveats:** User list matches payer, receiver or creator. Hard delete.
