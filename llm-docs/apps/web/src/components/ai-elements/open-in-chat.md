# apps/web/src/components/ai-elements/open-in-chat.tsx

**Purpose:** Dropdown to open a prompt in external AI chats (ChatGPT, Claude, T3, Scira, v0, Cursor).

**Key contents:** `OpenIn` context with trigger, content, label, separator and per-provider items that build query URLs.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` DropdownMenu/Button.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Sends the prompt text to third-party sites via URL; mind privacy for user financial data.
