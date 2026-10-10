# apps/web/src/components/ai-elements/file-tree.tsx

**Purpose:** Expandable file/folder tree.

**Key contents:** `FileTree` with controllable expanded and selected paths, folder, file, icon, name and actions parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Collapsible.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
