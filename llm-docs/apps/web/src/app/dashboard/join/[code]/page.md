# apps/web/src/app/dashboard/join/[code]/page.tsx

**Purpose:** Route for shared group join links (`/dashboard/join/<code>`).

**Key contents:** Awaits `params` and renders `JoinGroup` with the code.

**Depends on / used by:** `components/groups/join-group.tsx`; links are produced by `join-link-card.tsx`.

**Decisions & caveats:** Lives under `/dashboard` so `proxy.ts` makes signed-out visitors sign in first and return here. No server prefetch; the preview is fetched client-side.
