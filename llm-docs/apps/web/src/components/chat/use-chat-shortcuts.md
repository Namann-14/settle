# apps/web/src/components/chat/use-chat-shortcuts.ts

**Purpose:** Page-level keyboard shortcuts for the chat screen.

**Key contents:** `useChatShortcuts` binds Esc (stop while busy), `/` (focus input unless typing), Ctrl/Cmd+Shift+O (new chat) and Ctrl/Cmd+Shift+C (copy last response) on `window`.

**Depends on / used by:** Used by `chat/chat-panel.tsx`.

**Decisions & caveats:** Handlers are kept in a ref so the listener is bound once. Uses `e.code` for the letter shortcuts so they work across layouts. Enter, Shift+Enter and Up-to-edit live on the textarea, not here.
