# apps/web/src/components/ai-elements/conversation.tsx

**Purpose:** Scrolling chat container that sticks to the bottom, with empty state, scroll button and markdown download.

**Key contents:** `Conversation` (use-stick-to-bottom), content, empty state, scroll button, `messagesToMarkdown`, `ConversationDownload`.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Imported by the chat UI (`components/chat/`). Uses `use-stick-to-bottom`, `UIMessage` from `ai`, `@settle/ui` Button.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
