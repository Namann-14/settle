# apps/web/src/components/ai-elements/artifact.tsx

**Purpose:** Container for generated artifacts (code, docs) with header, title and actions.

**Key contents:** `Artifact`, `ArtifactHeader`, `ArtifactTitle`, `ArtifactDescription`, `ArtifactActions`/`ArtifactAction` (tooltip buttons), `ArtifactClose`, `ArtifactContent`.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Button and tooltip.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
