# apps/web/src/components/ai-elements/checkpoint.tsx

**Purpose:** Marker/divider in a conversation that lets the user restore to that point.

**Key contents:** `Checkpoint`, `CheckpointIcon`, `CheckpointTrigger` (tooltip button) with separator line.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Imported by the chat UI (`components/chat/`). Uses `@settle/ui` Button/Separator.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
