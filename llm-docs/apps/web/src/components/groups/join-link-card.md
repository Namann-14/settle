# apps/web/src/components/groups/join-link-card.tsx

**Purpose:** Shows a group's shareable join link on the members tab.

**Key contents:** `JoinLinkCard({ groupId, groupName, isAdmin })`: read-only URL (`<origin>/dashboard/join/<code>`), Copy, native Share when available, and an admin-only "Reset link".

**Depends on / used by:** Uses `useJoinLink`, `useResetJoinLink`, `@settle/ui` skeleton, sonner. Rendered by `group-detail.tsx`.

**Decisions & caveats:** `navigator.share` support is checked after mount so SSR markup stays stable. The URL is built from `window.location.origin`, so it points at whichever host the user is on. Reset replaces the code server-side; the old link stops working.
