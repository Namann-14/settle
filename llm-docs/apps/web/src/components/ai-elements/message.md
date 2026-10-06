# apps/web/src/components/ai-elements/message.tsx

**Purpose:** Chat message primitives: bubble, actions, branching and markdown response.

**Key contents:** `Message` (user/assistant), content, actions/action, branch controls (`MessageBranch*`), `MessageResponse` using Streamdown, attachments and toolbar.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Imported by the chat UI (`components/chat/`). Uses `streamdown`, `UIMessage` from `ai`, `@settle/ui` Button/ButtonGroup.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
