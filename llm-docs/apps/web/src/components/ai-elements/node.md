# apps/web/src/components/ai-elements/node.tsx

**Purpose:** Card-based React Flow node with optional source/target handles.

**Key contents:** `Node` (Card with handles), header, title, description, action, content, footer.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@xyflow/react`, `@settle/ui` Card; pairs with `canvas`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
