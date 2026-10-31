# apps/web/src/hooks/mutations/useGroupMembers.ts

**Purpose:** Mutations for group membership, invites and join links.

**Key contents:** `useInviteMember`, `useRemoveMember`, `useCancelInvitation` (scoped to a group id); `useRespondToInvitation` (accept/decline; invalidates `my-invitations`, plus `groups` on accept); `useJoinGroup` (invalidates `groups`, `group-join`, `my-invitations`); `useResetJoinLink` (writes the new link into the `group-join-link` cache).

**Depends on / used by:** Uses `lib/api/groups`. Exported through `hooks/mutations/index.ts`.

**Decisions & caveats:** Inviting only invalidates the group's invitations, not groups or balances, because membership doesn't change until the invitee accepts.
