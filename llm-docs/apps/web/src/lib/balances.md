# apps/web/src/lib/balances.ts

**Purpose:** Client-side balance and money-formatting helpers for the dashboard.

**Key contents:** `computeBalances(expenses, settlements, meId)` returns owed/owe/net, counterpart counts and a per-group net map; `myShareSince(expenses, meId, days)`; `formatMoney(amount, currency, {signed})` with zero fraction digits.

**Depends on / used by:** `types/expense.ts`, `types/settlement.ts`; dashboard overview cards. Server-side group balances come from `/groups/{id}/balances`.

**Decisions & caveats:** Balances are derived on the client from data already fetched and ignore currency, summing mixed currencies as-is; this differs from the spending summary, which only counts the default currency. Soft-deleted expenses are skipped. `formatMoney` rounds to whole units.
