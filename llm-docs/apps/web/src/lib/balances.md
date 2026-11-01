# apps/web/src/lib/balances.ts

**Purpose:** Balance and money-formatting helpers for the dashboard.

**Key contents:** `computeBalances(expenses, settlements, meId)` returns owed/owe/net, counterpart counts and a per-group net map from client-side data; `computeStanding(groups, balancesByGroup, meId)` builds the Overview ledger (people who pay the user and people the user pays, per-currency totals, the user's net per group) from server balances; `formatMoney(amount, currency, {signed})` with zero fraction digits; `formatTotals` joins per-currency totals ("₹7,760 + $20").

**Depends on / used by:** `types/expense.ts`, `types/settlement.ts`, `types/group.ts`, `lib/people.buildNameMap`. `computeBalances` is used by the groups and settlements pages; `computeStanding` by `hooks/useStanding`.

**Decisions & caveats:** `computeBalances` only sees the expenses a page fetched and sums mixed currencies as-is; prefer `computeStanding` where accuracy matters. `computeStanding` rows are the api's simplified transfers (fewest payments) involving the user, summed per person and currency, so they can differ from raw pairwise debts (decisions.md, 2026-11-01). Soft-deleted expenses are skipped. `formatMoney` rounds to whole units.
