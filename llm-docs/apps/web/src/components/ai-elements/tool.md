# apps/web/src/components/ai-elements/tool.tsx

**Purpose:** Generic collapsible tool-call card (name, status badge, JSON input and output).

**Key contents:** `Tool`, `ToolHeader` (maps AI SDK tool states to badges via exported `getStatusBadge`), `ToolContent`, `ToolInput`, `ToolOutput`.

**Depends on / used by:** Uses `./code-block`, `ai` types `ToolUIPart`/`DynamicToolUIPart`. Imported by `sandbox.tsx`.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library. The chat UI instead renders tool calls as friendly ChainOfThought steps via `chat/tool-steps.ts`, hiding raw JSON and ids.
