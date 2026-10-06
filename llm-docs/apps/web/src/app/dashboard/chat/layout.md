# apps/web/src/app/dashboard/chat/layout.tsx

**Purpose:** Shared layout sizing the chat panel for both new-chat and existing-chat routes.

**Key contents:** A flex column of height `100svh - 6rem` so the conversation scrolls inside the panel, not the page.

**Depends on / used by:** Wraps `chat/page.tsx` and `chat/[id]/page.tsx`; sits inside `dashboard/layout.tsx`.

**Decisions & caveats:** 6rem is the h-16 topbar plus the dashboard layout's p-4 padding; changing either breaks the height. Chat history lives in the app sidebar, not here.
