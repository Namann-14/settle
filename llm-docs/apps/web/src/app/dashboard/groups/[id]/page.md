# apps/web/src/app/dashboard/groups/[id]/page.tsx

**Purpose:** Group detail route; prefetches everything the group view needs.

**Key contents:** Awaits `params`, then prefetches group, balances, and the group's expenses and settlements (limit 100) before rendering `GroupDetail`.

**Depends on / used by:** Uses `Prefetch`/`serverQueries` (`apps/web/src/lib/server-prefetch.tsx`) and `components/groups/group-detail`; paired with `loading.tsx`.

**Decisions & caveats:** Prefetches are not awaited, so HTML streams immediately (see decisions.md, faster first load). Query keys must match client hooks.
