# apps/web/src/components/chat/markdown.tsx

**Purpose:** Renders chat message text as markdown.

**Key contents:** `ChatMarkdown`, a memoised Streamdown wrapper with the cjk, code, math and mermaid plugins. It trims the top margin of the first child and the bottom margin of the last.

**Depends on / used by:** Uses `streamdown` and `@streamdown/*`. Used by `chat/chat-panel.tsx` (user bubbles) and `chat/assistant-message.tsx` (answers).

**Decisions & caveats:** This is the only piece kept from the old ai-elements `MessageResponse`. shadcn's AI Elements Message pattern also renders replies with Streamdown. The memo compares `children` and `isAnimating` only, so earlier messages don't re-parse while a new one streams in.
