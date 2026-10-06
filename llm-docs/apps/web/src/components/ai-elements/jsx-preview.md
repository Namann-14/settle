# apps/web/src/components/ai-elements/jsx-preview.tsx

**Purpose:** Safely renders streamed JSX strings, auto-closing unfinished tags.

**Key contents:** `JSXPreview` context, content, error display, and a helper that completes partial JSX while streaming.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `react-jsx-parser`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Evaluates model-produced JSX; keep components and bindings allow-listed if ever used.
