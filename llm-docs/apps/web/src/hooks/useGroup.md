# apps/web/src/hooks/useGroup.ts

**Purpose:** React Query hooks for a single group and its sub-resources.

**Key contents:** `useGroup(id?, options)` (disabled while id is undefined; accepts `refetchOnMount`), `useGroupBalances(id)`, `useGroupInvitations(id)`, `useJoinLink(groupId)` (key `group-join-link`), `useJoinPreview(code)` (key `group-join`, no retry).

**Depends on / used by:** `lib/api/groups.ts`; group detail pages, `expense-sheet.tsx`, `join-link-card.tsx`, `join-group.tsx`.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load'). The expense sheet passes `refetchOnMount: "always"` so its member list is never stale. `useJoinPreview` doesn't retry because an invalid code is a normal 404.
