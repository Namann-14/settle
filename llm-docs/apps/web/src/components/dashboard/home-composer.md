# apps/web/src/components/dashboard/home-composer.tsx

**Purpose:** Dashboard landing screen styled like a new-chat page: greeting, one composer, starter ideas.

**Key contents:** `HomeComposer` (custom textarea form, starter chips that prefill the box, suggestion list that sends immediately) and the exported `useGreeting` hook.

**Depends on / used by:** Uses Clerk `useUser`, `chat/suggestions.ts`; `useGreeting` is also used by `overview-header.tsx`.

**Decisions & caveats:** Greeting depends on the client's hour, so it is set after mount to keep server render and hydration identical (returns null first). Submitting navigates to `/dashboard/chat?q=`; no chat state here. Enter submits unless Shift is held or IME composition is active.
