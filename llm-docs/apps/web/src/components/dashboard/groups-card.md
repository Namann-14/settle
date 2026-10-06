# apps/web/src/components/dashboard/groups-card.tsx

**Purpose:** Overview card listing the user's groups with per-group balance.

**Key contents:** `GroupsCard` with loading, error and empty states; each row shows initials, active member count and a signed balance coloured primary/destructive or 'Settled'.

**Depends on / used by:** Uses `useGroups`, `useExpenses`, `useSettlements`, `useCurrentUser`, `computeBalances().byGroup`.

**Decisions & caveats:** Balance uses a 0.005 epsilon to treat float dust as settled; same 100-item client-side limitation as `balance-summary.tsx`.
