# apps/web/src/components/settlements/settlements-page.tsx

**Purpose:** Settle up page: what's left to settle, the Settle AI plan, and payment history.

**Key contents:** `SettlementsPage` = `PageContainer` > `PageHeader` ("Settle up", primary "Record a payment") > `FigureStrip` (owed to you, you owe, settled in the last 30 days) > two-up (from `lg`) of `SettlePlanCard` and a "Payment history" panel with a group filter select (shown with 2+ groups). Exports `SettlementRow` (props stable; used by `groups/group-detail.tsx`): "X paid Y", group / date / note, signed amount, delete button.

**Depends on / used by:** Uses `useStanding` (per-group server balances, same numbers as Overview), `useSettlements({ limit: 100 })`, `useDeleteSettlement`, lib/balances and lib/people; opens `RecordSettlementDialog`.

**Decisions & caveats:** Owed/owe figures come from `useStanding` (`computeStanding`) rather than client-side `computeBalances` over the latest 100 expenses, so they cover every expense and match Overview; multiple currencies show via `formatTotals`. "Settled in the last 30 days" still sums the fetched settlements as-is in the default currency. The delete button is always visible (no hover reveal) so it works on touch, and is 44px on phones. Deleting has no confirm (unchanged behaviour).
