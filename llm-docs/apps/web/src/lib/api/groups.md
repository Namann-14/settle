# apps/web/src/lib/api/groups.ts

**Purpose:** Client for `/api/groups`, member/invitation sub-resources, join links and the invite inbox.

**Key contents:** `listGroups`, `getGroup`, `createGroup`, `updateGroup`, `deleteGroup`, `addMember`, `getGroupBalances`, `inviteMember`, `listInvitations`, `cancelInvitation`, `removeMember`, `getJoinLink`, `resetJoinLink`, `previewJoin`, `joinGroup`, `listMyInvitations`, `respondToInvitation`.

**Depends on / used by:** `types/group.ts`; `hooks/useGroups.ts`, `hooks/useGroup.ts`, `hooks/useInvitations.ts`, `hooks/mutations/useGroupMembers.ts`.

**Decisions & caveats:** Has its own copy of `handleResponse`. Backend `detail` text (e.g. "can't remove until settled", expired invite) is shown to the user. Join codes are URL-encoded. `respondToInvitation` returns the group on accept and nothing on decline (204).
