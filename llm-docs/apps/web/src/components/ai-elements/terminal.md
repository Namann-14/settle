# apps/web/src/components/ai-elements/terminal.tsx

**Purpose:** Terminal-style output display with ANSI color rendering, copy and clear actions.

**Key contents:** `Terminal` (with streaming flag), Header, Title, Status, Actions, CopyButton, ClearButton, Content.

**Depends on / used by:** Uses `ansi-to-react` and `@settle/ui` button.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
