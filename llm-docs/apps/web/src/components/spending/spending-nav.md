# apps/web/src/components/spending/spending-nav.tsx

**Purpose:** Sub-page navigation for the Spending section.

**Key contents:** Client component that renders the shared `SegmentedNav` pill track with Overview, Budgets, Recurring and Categories, marking the active one from `usePathname`.

**Depends on / used by:** Uses `SegmentedNav` from `components/dashboard/panel`; rendered by `app/dashboard/spending/layout.tsx`.

**Decisions & caveats:** Overview stays active for `?month=` URLs because `usePathname` ignores the query.
