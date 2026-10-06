# apps/web/src/components/ai-elements/attachments.tsx

**Purpose:** Display of file and source attachments in grid, inline or list variants.

**Key contents:** `Attachments`/`Attachment` with context, preview, info, remove and hover-card parts; helpers `getMediaCategory`, `getAttachmentLabel`.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `FileUIPart`/`SourceDocumentUIPart` types from `ai`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
