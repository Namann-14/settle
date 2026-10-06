# apps/web/src/lib/api/groups.ts

**Purpose:** Client for `/api/groups` and member/invitation sub-resources.

**Key contents:** `listGroups`, `getGroup`, `createGroup`, `updateGroup`, `deleteGroup`, `addMember`, `getGroupBalances`, `inviteMember`, `listInvitations`, `cancelInvitation`, `removeMember`.

**Depends on / used by:** `types/group.ts`; `hooks/useGroups.ts`, `hooks/useGroup.ts`.

**Decisions & caveats:** Has its own copy of `handleResponse`. Removing a member can be rejected until their balance is settled; the backend `detail` text is shown to the user.
