# apps/web/src/hooks/useStanding.ts

**Purpose:** Where the current user stands across all their groups, from server-side balances.

**Key contents:** `useStanding()` loads the current user and groups, fans out one `["group-balances", id]` query per group with `useQueries`, and returns `{ standing, groups, currency, isLoading, isError, retry }`, where `standing` comes from `computeStanding`.

**Depends on / used by:** `useCurrentUser`, `useGroups`, `lib/api/groups.getGroupBalances`, `lib/balances.computeStanding`. Used by `dashboard/standing.tsx` and `dashboard/overview-lists.tsx`.

**Decisions & caveats:** Shares its query key with `useGroupBalances`, so group pages and the overview reuse each other's cache, and `invalidateBalances` refreshes both after any expense or settlement write. Balances load after groups (a small client waterfall); the overview page does not prefetch them because group ids are unknown until groups resolve.
