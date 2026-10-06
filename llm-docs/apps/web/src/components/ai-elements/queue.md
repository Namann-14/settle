# apps/web/src/components/ai-elements/queue.tsx

**Purpose:** Displays a queue of messages/todos with collapsible sections, attachments and per-item actions.

**Key contents:** `Queue`, `QueueSection*`, `QueueList`, `QueueItem*` parts plus `QueueMessage`/`QueueTodo` types.

**Depends on / used by:** Uses `@settle/ui` button, collapsible, scroll-area.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
