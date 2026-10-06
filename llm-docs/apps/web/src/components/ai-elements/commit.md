# apps/web/src/components/ai-elements/commit.tsx

**Purpose:** Git commit display: hash, message, author, timestamp and changed files.

**Key contents:** Collapsible `Commit` with header, hash, message, metadata, author avatar, timestamp, copy button, content and file-change parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Avatar/Button/Collapsible.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
