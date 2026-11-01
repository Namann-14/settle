# apps/web/src/components/groups/invitations-bell.tsx

**Purpose:** Topbar inbox for group invites waiting on the user.

**Key contents:** `InvitationsBell`: bell button with a count badge and a popover listing each invite ("X invited you to Y") with Join and Decline `buttonClass` pills; the empty state says invites show up here.

**Depends on / used by:** Uses `useMyInvitations`, `useRespondToInvitation`, `initials` from `lib/people`, `@settle/ui` popover/button. Rendered by `dashboard/topbar.tsx`.

**Decisions & caveats:** Accepting navigates to the joined group. Inviter and group names come from `invited_by_name`/`group_name` on the invite, with fallbacks. Only group invites live here for now; it replaced the "notifications coming soon" placeholder.
