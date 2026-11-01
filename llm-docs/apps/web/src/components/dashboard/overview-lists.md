# apps/web/src/components/dashboard/overview-lists.tsx

**Purpose:** The two quieter lists under the Overview ledger.

**Key contents:** `GroupsList` (each group with the user's net in it, or "Settled", linking to the group) and `RecentActivity` (latest expenses and settlements merged into one feed, 6 rows; shows "your share" when someone else paid). Local `ListPanel` (a `Panel` + `PanelHeader` with a link), `RowsSkeleton` and `Retry`; rows use the shared `rowClass`.

**Depends on / used by:** `hooks/useStanding` (group nets), `useExpenses` / `useSettlements` with `{ limit: 8 }`, `useGroups`, `useCurrentUser`, `lib/people` name helpers. Rendered by `app/dashboard/overview/page.tsx`.

**Decisions & caveats:** The `{ limit: 8 }` params must match the page's `serverQueries` prefetch or the prefetch is ignored. Group nets come from the server's `/groups/{id}/balances`, not the client-side `computeBalances`. Each list fails independently with an inline retry.
