# apps/web/src/components/groups/groups-page.tsx

**Purpose:** Groups index page: key figures, search and balance filters, and a list of the user's groups.

**Key contents:** `GroupsPage` builds `PageContainer` > `PageHeader` ("Groups", New group) > `FigureStrip` (net across groups, most active group in the last 30 days, people you split with) > `SearchField` + `Segmented` filter (All / You're owed / You owe / Settled) > one `Panel` of `GroupRow`s. Each row links to the group and shows initials, name, members, last activity and the user's balance there; from `sm` it is a four-column table with a header row, below `sm` members and activity fold into a metadata line. `GroupsListSkeleton` mirrors the rows; errors show an inline retry; no groups shows a one-line prompt plus New group. Opens `CreateGroupDialog`.

**Depends on / used by:** Uses `dashboard/panel.tsx` primitives, `useStanding` (balances), `useExpenses`/`useSettlements` with `{ limit: 100 }` (activity only; matches the route's prefetch keys), `useCurrentUser`, `create-group-dialog.tsx`. Rendered by `app/dashboard/groups/page.tsx`.

**Decisions & caveats:** Balances come from the api's per-group balances via `useStanding` (`groupNet`, same `["group-balances", id]` cache as the overview and group page), not from the latest 100 expenses as before, so they cover every expense. The net figure sums per currency and joins mixed currencies with " + "; tone only applies when there is a single currency. "Last activity" and "Most active" still use the latest 100 expenses/settlements, so a group with only older activity reads "No recent activity". Status uses a 0.005 epsilon.
