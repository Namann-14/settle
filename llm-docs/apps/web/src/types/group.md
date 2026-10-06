# apps/web/src/types/group.ts

**Purpose:** Types for groups, members, balances and invitations.

**Key contents:** `Group`, `GroupMember`, `GroupRole`, `GroupBalances`, `MemberBalance`, `Transfer`, `Invitation` plus payload types.

**Depends on / used by:** `lib/api/groups.ts`.

**Decisions & caveats:** In `MemberBalance.net`, positive means the group owes the member. Removed members keep a row with `removed_at`.
