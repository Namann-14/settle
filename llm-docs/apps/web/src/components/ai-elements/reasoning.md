# apps/web/src/components/ai-elements/reasoning.tsx

**Purpose:** Collapsible 'Thought for N seconds' block that renders model reasoning text as streaming markdown.

**Key contents:** `Reasoning` (controllable open state, auto-open while streaming, auto-close once), `ReasoningTrigger` (takes `getThinkingMessage`), `ReasoningContent` rendered with Streamdown plus code/math/mermaid/cjk plugins.

**Depends on / used by:** Uses `./shimmer`, `streamdown` and `@streamdown/*`, radix controllable state. Used by `chat/assistant-message.tsx`.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Used actively. The built-in auto-close only fires once per mount, so assistant-message controls `open` itself (see that doc). The streamdown plugins add notable bundle weight.
