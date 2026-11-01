# apps/web/src/components/dashboard/home-composer.tsx

**Purpose:** Dashboard home (`/dashboard`, "New chat") and the entry point to Settle AI: greeting, one composer, starters, a "Try asking" list.

**Key contents:** `HomeComposer` (Inter semibold 28/32px greeting with one muted line under it, a 16px-radius bordered composer with a token focus ring, starter pills via `buttonClass` secondary/sm that prefill the box, a primary round send button, and the ideas as plain hairline rows that send straight away) and the exported `useGreeting` hook.

**Depends on / used by:** Uses Clerk `useUser`, `chat/suggestions.ts`, `buttonClass` from `dashboard/panel.tsx`. Rendered by `app/dashboard/page.tsx`.

**Decisions & caveats:** Greeting depends on the client's hour, so it is set after mount to keep server render and hydration identical (returns null first; the heading reserves its line so nothing shifts). Submitting navigates to `/dashboard/chat?q=`; no chat state here. Enter submits unless Shift is held or IME composition is active. No per-element entrance animation or icon beside the greeting: the route template's single fade is the only motion (DESIGN.md Motion).
