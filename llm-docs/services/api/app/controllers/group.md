# services/api/app/controllers/group.py

**Purpose:** Group lifecycle, membership, invitations, join links and balance computation.

**Key contents:** Create/get/list/update/delete group (update and delete are ADMIN only); `add_member` (admin only); `invite_by_email` (any active member; always creates a pending invite, even for existing users, and pings them on Telegram with Join/Decline buttons via `INVITE_ACCEPT_PREFIX`/`INVITE_DECLINE_PREFIX`); `list_my_invitations`, `respond_to_invitation` (accept joins as MEMBER, decline marks DECLINED; notifies the inviter); `cancel_invitation` (inviter or admin only); join link: `get_join_code` (any member, created lazily), `reset_join_code` (admin only), `preview_join`, `join_by_code` (also accepts the user's pending invites to that group); `remove_member`; `get_group_balances` (nets plus simplified transfers).

**Depends on / used by:** `repositories/*`, `services/telegram`, `services/balances` (`compute_group_nets`, `simplify_debts`), `schemas/balances|group|group_member`. Used by `routes/groups.py`, `routes/invitations.py` and `controllers/telegram.py` (invite buttons). Tested by `tests/test_group_invites.py`.

**Decisions & caveats:** Nobody is added without consent: an email invite waits for accept/decline, while pressing Join on a join link is itself the consent. Invites carry no role, so a member can't mint admins. An expired invite still marked PENDING holds the one-pending-per-email index, so re-inviting marks it EXPIRED first. Telegram pings are best effort; the in-app inbox is the source of truth. Removed members only appear in balances while they still carry a non-zero net. Debt simplification lives here in api (Decimal), and services/ai consumes its `/groups/{id}/balances` output.
