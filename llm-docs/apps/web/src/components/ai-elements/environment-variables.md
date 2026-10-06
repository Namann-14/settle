# apps/web/src/components/ai-elements/environment-variables.tsx

**Purpose:** Display of environment variables with masked values and a show/hide toggle.

**Key contents:** `EnvironmentVariables` context, header, title, toggle switch, group, name/value, copy button, required badge.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Badge/Button/Switch.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Values are only visually masked in the UI; do not pass real secrets to it.
