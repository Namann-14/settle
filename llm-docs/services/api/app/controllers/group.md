# services/api/app/controllers/group.py

**Purpose:** Group lifecycle, membership, invitations and balance computation.

**Key contents:** Create/get/list/update/delete group (update and delete are ADMIN only); `add_member` (admin only); `invite_by_email` (any active member; existing users are added immediately, others get a pending invitation); list/cancel invitations; `claim_invitations` (turns pending invites into memberships on sign-in); `remove_member`; `get_group_balances` (nets plus simplified transfers).

**Depends on / used by:** `repositories/*`, `services/balances` (`compute_group_nets`, `simplify_debts`), `schemas/balances|group|group_member`. Used by `routes/groups.py`; `claim_invitations` is called during user sync.

**Decisions & caveats:** Removed members only appear in balances while they still carry a non-zero net, so debts are never hidden. Debt simplification lives here in api (Decimal), and services/ai consumes its `/groups/{id}/balances` output rather than recomputing.
