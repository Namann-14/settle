# apps/web/src/components/ai-elements/stack-trace.tsx

**Purpose:** Collapsible, parsed stack-trace viewer with copy and file-path click handling.

**Key contents:** `StackTrace` with Header, Error(Type/Message), Actions, CopyButton, ExpandButton, Content, Frames; parses raw JS stack strings into frames and dims internal ones.

**Depends on / used by:** Uses `@settle/ui` button/collapsible.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
