# apps/web/src/hooks/mutations/useGroupMembers.ts

**Purpose:** Mutations for group membership.

**Key contents:** `useInviteMember`, `useRemoveMember` and `useCancelInvitation`, each scoped to a group id and invalidating groups, invitations and/or balances.

**Depends on / used by:** Uses `lib/api/groups`.

**Decisions & caveats:** Nothing notable.
