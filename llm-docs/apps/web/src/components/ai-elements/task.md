# apps/web/src/components/ai-elements/task.tsx

**Purpose:** Collapsible 'task' block with a title and list of items (e.g. files searched).

**Key contents:** `Task`, `TaskTrigger` (title with search icon), `TaskContent`, `TaskItem`, `TaskItemFile`.

**Depends on / used by:** Uses `@settle/ui` collapsible. Used by `chat/assistant-message.tsx` to show what each tool returned.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Used actively.
