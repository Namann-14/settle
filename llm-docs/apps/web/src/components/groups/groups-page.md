# apps/web/src/components/groups/groups-page.tsx

**Purpose:** Groups index page with summary stats, search, status filters and group cards.

**Key contents:** `GroupsPage` shows stats (people, net balance, most active group in 30 days), filters All/You're owed/You owe/Settled, and a `GroupCard` grid with member avatars and balance; opens `CreateGroupDialog`.

**Depends on / used by:** Uses `useGroups`, `useExpenses`, `useSettlements`, `computeBalances`, `create-group-dialog.tsx`, `overview-skeleton.tsx`.

**Decisions & caveats:** Balances are computed client-side from the latest 100 expenses/settlements. Status uses a 0.005 epsilon. Current user is placed first in the avatar stack.
