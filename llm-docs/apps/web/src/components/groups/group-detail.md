# apps/web/src/components/groups/group-detail.tsx

**Purpose:** Group page: balances, settle plan, AI insight, and tabs for expenses, settlements and members.

**Key contents:** `GroupDetail` plus sub-components `GroupExpenses`, `GroupSettlements`, `GroupMembers` (invite/cancel/remove, admin-only), `BalancesPanel`, `GroupInsightCard`, and exported `GroupDetailSkeleton`.

**Depends on / used by:** Uses `useGroup`, `useGroupBalances`, `useGroupInvitations`, `useGroupInsight`, `expense-sheet.tsx`, `ai-quick-add.tsx`, `settlements/*`, `myImpact` from `expenses-page.tsx`.

**Decisions & caveats:** Admin rights are derived client-side from the active member list (`role === 'ADMIN'`); the API remains the real enforcement. Quick-add is locked to this group. Large file mixing several concerns; split before adding more.
