# apps/web/src/components/chat/assistant-message.tsx

**Purpose:** Renders one assistant turn in the chat as reasoning, then tool steps, then the answer.

**Key contents:** Props `message`, `isStreaming`, `canAnswer` (latest turn and idle) and `onApproval`. `AssistantMessage` sorts message parts into reasoning text, `dynamic-tool` parts and text parts, and lays them out in one `Trace`:
- A "Thinking" / "Thought" line that expands to the reasoning text.
- A Chain of Thought summary, "Working on it" / "Done in N steps" (error status if any step failed, content `keepMounted`), that expands to one line per tool call. An answered `add_expense` call is an `ExpenseLine`: "Adding…", "Added X ₹N", "Didn't add X", "Couldn't add X", or "Not answered" on older turns.
- Pending `add_expense` approvals show as `ExpenseConfirmation` cards outside the summary, so they are never hidden in a collapsed section.
- Each `ToolLine` shows the icon and the active or done label, with a result count. It expands to the readable args (as secondary Badges) and up to 6 result lines.

The answer follows as `ChatMarkdown`.

**Depends on / used by:** Uses `@settle/ui` trace and badge, `chat/expense-confirmation.tsx`, `chat/markdown.tsx`, `chat/tool-steps.ts` for labels and formatting, and `@/lib/chat-types`. Used by `chat/chat-panel.tsx`.

**Decisions & caveats:** Built on shadcn AI Elements (Reasoning and Tool patterns on Trace). It replaced the old ai-elements Reasoning, ChainOfThought and Task. The "Write the answer" step was dropped to match the Chain of Thought pattern. Expense previews come from `data-expense-approval` parts keyed by toolCallId. The open state for reasoning and steps is `boolean | undefined`: undefined follows the stream (open while it runs, collapsed after), and a user toggle sticks. Reasoning is controlled because the model reasons once per call, so an auto-close that fires once would leave later rounds open. Loading text uses the `shimmer` utility. Reasoning duration is no longer shown: the AI SDK doesn't time it, and the old component measured it in the browser. Tool output goes through `outputLines`, which strips ids on purpose. Failed tools show as error lines.
