# apps/web/src/components/dashboard/balance-summary.tsx

**Purpose:** Four stat tiles on the overview: net balance, owed to you, you owe, spent in 30 days.

**Key contents:** `BalanceSummary` computes via `computeBalances` and `myShareSince` from the latest 100 expenses and settlements; shows skeletons while loading. Local `Stat` tile highlights the net balance.

**Depends on / used by:** Uses hooks `useCurrentUser`, `useExpenses`, `useSettlements`, `@/lib/balances`, `overview-skeleton.tsx`, `panel.tsx`.

**Decisions & caveats:** Balances are computed client-side from only the latest 100 expenses/settlements, so heavy users could see partial numbers. Falls back to USD if the user has no default currency yet. 'Spent' is the user's share, matching the 'my spending' rule in decisions.md. Stat cards fade up with a staggered delay (`index` prop) and use `.lift`.
