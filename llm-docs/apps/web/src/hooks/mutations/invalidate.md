# apps/web/src/hooks/mutations/invalidate.ts

**Purpose:** Shared React Query invalidation helpers.

**Key contents:** `invalidateSpending` invalidates `spending-summary`; `invalidateBalances` invalidates group balances, settle plan, group insight, expenses and spending.

**Depends on / used by:** Used by most mutation hooks.

**Decisions & caveats:** Derived data (balances, AI plan and insight, spending totals) all depend on expenses and settlements, so any write to either must call `invalidateBalances`. Query keys here must match the query hooks and server prefetch keys.
