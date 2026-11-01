# apps/web/src/app/dashboard/settlements/page.tsx

**Purpose:** Settlements route with prefetched data.

**Key contents:** Prefetches settlements (`limit: 100`) and renders `SettlementsPage`.

**Depends on / used by:** Uses `apps/web/src/lib/server-prefetch.tsx` and `components/settlements/settlements-page`.

**Decisions & caveats:** The params must match `SettlementsPage`'s `useSettlements` key. Expenses are no longer prefetched: balances come from `useStanding` (currentUser and groups are prefetched by the dashboard layout; per-group balances load on the client).
