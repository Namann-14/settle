# apps/web/src/components/ai-elements/snippet.tsx

**Purpose:** Inline copyable code snippet (input-group with copy button).

**Key contents:** `Snippet`, `SnippetAddon`, `SnippetText`, `SnippetInput`, `SnippetCopyButton` (clipboard with copied-state feedback).

**Depends on / used by:** Uses `@settle/ui` input-group.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
