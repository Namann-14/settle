# services/api/app/schemas/balances.py

**Purpose:** Response schemas for group balances.

**Key contents:** `MemberBalance` (net per user), `Transfer` (from, to, amount), `GroupBalancesResponse`.

**Depends on / used by:** Produced by `controllers/group.py` using `services/balances.py`; served by `routes/groups.py`.

**Decisions & caveats:** Positive net means the group owes the member; transfers are a greedy minimal set (at most n-1).
