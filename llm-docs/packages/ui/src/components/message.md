# packages/ui/src/components/message.tsx

**Purpose:** Presentational building blocks for chat messages.

**Key contents:** Exports MessageGroup, Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader; styling driven by `data-slot` attributes and group-has selectors (e.g. avatar offset when a footer exists).

**Depends on / used by:** Uses `cn`; paired with message-scroller and marker in the chat UI.

**Decisions & caveats:** Purely styling, no state; server-component safe.
