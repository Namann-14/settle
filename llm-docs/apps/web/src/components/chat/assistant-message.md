# apps/web/src/components/chat/assistant-message.tsx

**Purpose:** Renders one assistant turn in the chat as reasoning, then tool steps, then the answer.

**Key contents:** `AssistantMessage` groups message parts into reasoning text, `dynamic-tool` parts and text parts. Tools appear as a ChainOfThought of steps (icon, active/done label, readable args, plus a collapsed `ToolTask` listing up to 6 result lines) ending with a 'Write the answer' step.

**Depends on / used by:** Uses ai-elements chain-of-thought, message, reasoning, shimmer, task; `chat/tool-steps.ts` for labels/formatting; `@/lib/chat-types`. Used by `chat/chat-panel.tsx`.

**Decisions & caveats:** Open state for Reasoning and ChainOfThought is `boolean | null`: null follows the stream (open while streaming, collapsed after) and a user toggle sticks. Reasoning is controlled because the component's own auto-close fires only once, which left later reasoning rounds stuck open. Tool output is shown through `outputLines`, which strips ids on purpose.
