# apps/web/src/components/settlements/settlements-page.tsx

**Purpose:** Settlements page: balance stats, plan card and history list.

**Key contents:** Client page loading groups, expenses and settlements, computing balance stats with `computeBalances`, a group filter, `SettlePlanCard`, and exported `SettlementRow` with delete.

**Depends on / used by:** Uses `useDeleteSettlement`, `useExpenses`, `useSettlements`, lib/balances and lib/people; opens `RecordSettlementDialog`.

**Decisions & caveats:** Stats are derived client-side from the latest 100 expenses and settlements, so very large histories may be incomplete.
