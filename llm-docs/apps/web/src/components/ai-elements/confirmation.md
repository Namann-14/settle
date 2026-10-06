# apps/web/src/components/ai-elements/confirmation.tsx

**Purpose:** Approval UI for tool calls: request, accepted/rejected states and action buttons.

**Key contents:** `Confirmation` driven by `ToolUIPart` state, with title, request, accepted, rejected and actions parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Alert/Button and `ToolUIPart` from `ai`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Renders only for the matching tool-approval state.
