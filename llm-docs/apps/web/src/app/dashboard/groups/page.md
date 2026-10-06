# apps/web/src/app/dashboard/groups/page.tsx

**Purpose:** Groups list route with prefetched data.

**Key contents:** Prefetches expenses and settlements (limit 100) and renders `GroupsPage`.

**Depends on / used by:** Uses `apps/web/src/lib/server-prefetch.tsx` and `components/groups/groups-page`.

**Decisions & caveats:** Expenses and settlements are prefetched, presumably for per-group balance figures; keys must match the client hooks.
