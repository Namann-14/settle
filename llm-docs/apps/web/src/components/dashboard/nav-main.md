# apps/web/src/components/dashboard/nav-main.tsx

**Purpose:** Primary sidebar navigation.

**Key contents:** `NavMain` renders New chat, Overview, Spending, Groups, Expenses, Settlements, Settings links with active state.

**Depends on / used by:** Uses `@settle/ui` sidebar; rendered by `app-sidebar.tsx`.

**Decisions & caveats:** `/dashboard` matches exactly, others also match sub-routes so e.g. a group detail page keeps Groups highlighted. Routes use `as const` for typed Next links.
