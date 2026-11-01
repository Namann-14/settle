# apps/web/src/components/dashboard/search-palette.tsx

**Purpose:** The topbar search: a Ctrl/⌘K command palette for expenses, groups, people, actions and pages.

**Key contents:** `SearchPalette` renders the topbar trigger (flat pill, 40px on phones / 36px from sm, colour-only hover) plus a `CommandDialog`. Expenses are searched on the server (`listExpenses({ q, limit: 8, include_group_expenses: true })`, debounced 250 ms, at least 2 characters, cached 30 s). Groups, people (everyone sharing a group with you, once each) and `NAV_ITEMS` pages are filtered locally from cached data. Actions (Add expense, New group, Settle up) open their own `ExpenseSheet`, `CreateGroupDialog` and `RecordSettlementDialog`. The last row, "Ask Settle AI", goes to `/dashboard/chat?q=`.

**Depends on / used by:** `@settle/ui` command (cmdk), `useGroups`, `useCurrentUser`, `lib/api/expenses`, `nav-main` `NAV_ITEMS`; rendered by `topbar.tsx`.

**Decisions & caveats:** `shouldFilter={false}`: cmdk's own fuzzy filter would hide server matches whose text doesn't fuzzy-match the query. Because of that, the highlighted row is controlled and resets to the top result whenever the results change; otherwise "Ask Settle AI" (the only row before the expense search returns) stayed highlighted and Enter asked the AI. Expense search covers every expense in your groups, including ones you're "not involved" in. Picking a person opens the first group you share; there is no per-person page yet. The AI row uses a plain message icon, not a sparkle (DESIGN.md: AI is named in words). The trigger reads just "Search" on phones and the full "Search expenses, groups, people" from sm up.
