# apps/web/src/components/dashboard/recent-settlements-card.tsx

**Purpose:** Overview card with the 5 most recent settlements.

**Key contents:** `RecentSettlementsCard` fetches up to 8 settlements, sorts by date, shows 'A -> B' with amount, with loading/error/empty states.

**Depends on / used by:** Uses `useSettlements`, `useGroups`, `useCurrentUser`, `panel.tsx`.

**Decisions & caveats:** There is no GET /users/{id}, so counterparty names are resolved from already-fetched group members and fall back to 'Member' (e.g. no group or unnamed member).
