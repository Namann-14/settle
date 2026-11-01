# apps/web/src/components/groups/join-group.tsx

**Purpose:** Landing view for a shared join link.

**Key contents:** `JoinGroup({ code })`: previews the group (name, description, member count), then "Join group" / "Not now"; existing members get an "Open group" button; invalid or reset codes say so and link back to groups. Laid out as one narrow `Panel` with a row-shaped skeleton, Inter title (no serif or eyebrow) and `buttonClass` buttons.

**Depends on / used by:** Uses `useJoinPreview`, `useJoinGroup`, `initials`, `dashboard/panel.tsx` (`PageContainer`, `Panel`, `buttonClass`), `@settle/ui` skeleton. Rendered by `app/dashboard/join/[code]/page.tsx`.

**Decisions & caveats:** Pressing Join is the consent, so the api adds the user immediately (and answers any pending invite to that group). On success it `router.replace`s to the group so Back doesn't return to the join page.
