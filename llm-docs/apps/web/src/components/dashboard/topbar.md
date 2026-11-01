# apps/web/src/components/dashboard/topbar.tsx

**Purpose:** Sticky top bar of the dashboard.

**Key contents:** `Topbar` with sidebar trigger, the `SearchPalette` trigger, the `InvitationsBell` group-invite inbox, user name and Clerk `UserButton`.

**Depends on / used by:** Uses `@settle/ui` sidebar, Clerk, `components/dashboard/search-palette`, `components/groups/invitations-bell`.

**Decisions & caveats:** Solid 56px bar with a hairline (no translucent blur), per DESIGN.md. The search box is a button that opens the palette; the palette also listens for Ctrl/⌘K itself. The search wrapper is `min-w-0` and the right cluster `shrink-0`, so the avatar never gets pushed off a 375px screen.
