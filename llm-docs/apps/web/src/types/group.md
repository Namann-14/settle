# apps/web/src/types/group.ts

**Purpose:** Types for groups, members, balances, invitations and join links.

**Key contents:** `Group`, `GroupMember`, `GroupRole`, `GroupBalances`, `MemberBalance`, `Transfer`, `InvitationStatus` (incl. `DECLINED`), `Invitation` (optional `group_name`, `invited_by_name`), `InviteMemberPayload` (email only), `InviteMemberResponse` (always `invited`), `JoinLink`, `JoinPreview`.

**Depends on / used by:** `lib/api/groups.ts`.

**Decisions & caveats:** In `MemberBalance.net`, positive means the group owes the member. Removed members keep a row with `removed_at`. Mirrors `services/api/app/schemas/invitation.py`; the invite payload has no role so members can't invite admins.
