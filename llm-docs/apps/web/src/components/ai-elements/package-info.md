# apps/web/src/components/ai-elements/package-info.tsx

**Purpose:** Package upgrade display: name, version change, change type and dependencies.

**Key contents:** `PackageInfo` with header, name, change-type badge, version, description, content, dependencies.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Badge.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
