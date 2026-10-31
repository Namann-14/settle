# apps/web/src/hooks/useInvitations.ts

**Purpose:** React Query hook for the signed-in user's pending group invites.

**Key contents:** `useMyInvitations()` (key `my-invitations`), polling every 60s and refetching on window focus.

**Depends on / used by:** `listMyInvitations` in `lib/api/groups.ts`; used by `components/groups/invitations-bell.tsx`. Invalidated by `useRespondToInvitation` and `useJoinGroup`.

**Decisions & caveats:** Invites arrive from other people with no push channel to the browser, hence the polling.
