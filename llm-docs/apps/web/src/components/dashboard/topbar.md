# apps/web/src/components/dashboard/topbar.tsx

**Purpose:** Sticky top bar of the dashboard.

**Key contents:** `Topbar` with sidebar trigger, a disabled quick-search input, disabled notifications button, user name and Clerk `UserButton`.

**Depends on / used by:** Uses `@settle/ui` sidebar/input/button/tooltip, Clerk.

**Decisions & caveats:** Search and notifications are placeholders. They are wrapped in non-disabled spans because disabled controls lose pointer events and the 'coming soon' tooltip would never show.
