# apps/web/src/app/dashboard/overview/page.tsx

**Purpose:** Dashboard Overview, built to answer "where do I stand?": the net and a two-column ledger first, then groups, recent activity and this month's spending.

**Key contents:** Prefetches expenses and settlements (`{ limit: 8 }` each) and the spending summary, then renders `StandingSection`, `GroupsList` + `RecentActivity` side by side (stacked below `lg`), and `ThisMonthCard`.

**Depends on / used by:** `components/dashboard/standing.tsx`, `overview-lists.tsx`, `this-month-card.tsx`, `lib/server-prefetch.tsx`. The layout already prefetches the current user and groups.

**Decisions & caveats:** Replaced the nine-card grid (stat tiles, charts, AI card) on 2026-11-01; charts live on Spending and AI on the chat home (decisions.md). Group balances load on the client after groups, since their ids are not known at prefetch time. Prefetch params must match the hooks' keys exactly.
