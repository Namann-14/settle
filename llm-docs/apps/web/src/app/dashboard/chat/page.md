# apps/web/src/app/dashboard/chat/page.tsx

**Purpose:** "New chat" entry point that redirects to a fresh chat URL.

**Key contents:** Server component that generates `crypto.randomUUID()` and redirects to `/dashboard/chat/<id>`, carrying any `?q` prompt along.

**Depends on / used by:** Redirects to `chat/[id]/page.tsx`. `?q` comes from the dashboard's Ask AI card.

**Decisions & caveats:** The id is minted up front so it survives refreshes; no thread exists until a message is sent.
