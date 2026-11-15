import type { DynamicToolUIPart, UIMessage } from "ai";

// Shared by the /api/chat route (which writes these) and the chat UI (which
// reads them), so both agree on the shape of metadata and data parts.
export type ChatMessageMetadata = {
  // LangGraph checkpoint the thread was at after this assistant turn; sent
  // back on the next request so restoring a checkpoint forks from here.
  checkpointId?: string;
};

// What the user is asked to approve before the agent adds an expense
// (services/ai/app/tools/expense_actions.py builds it).
export type ExpensePreview = {
  description: string;
  merchant: string | null;
  amount: string;
  currency: string;
  date: string;
  group: string | null;
  paid_by: string;
  category: string | null;
  splits: { name: string; amount: string }[];
};

export type ChatDataParts = {
  suggestions: string[];
  // Written with id = toolCallId, next to the tool part it belongs to.
  "expense-approval": { toolCallId: string; expense: ExpensePreview };
};

export type ChatMessage = UIMessage<ChatMessageMetadata, ChatDataParts>;

// Chat history as the ai service stores it (services/ai/app/db/chat_store.py).
export type StoredPart =
  | { type: "reasoning" | "text"; text: string }
  | {
      type: "tool";
      id: string;
      name: string;
      args: unknown;
      output: string | null;
      error: boolean;
      // Present for tools that asked for approval; approved null = waiting.
      approval?: { id: string; approved: boolean | null; expense: ExpensePreview };
    }
  | { type: "suggestions"; items: string[] };

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  parts: StoredPart[];
  checkpoint_id: string | null;
};

export type ChatThreadSummary = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatThread = Omit<ChatThreadSummary, "created_at"> & {
  messages: StoredMessage[];
};

type StoredTool = Extract<StoredPart, { type: "tool" }>;

function toToolPart(p: StoredTool): DynamicToolUIPart {
  const base = { type: "dynamic-tool" as const, toolCallId: p.id, toolName: p.name, input: p.args };
  const approval = p.approval;
  if (approval?.approved === null) {
    return { ...base, state: "approval-requested", approval: { id: approval.id } };
  }
  if (approval?.approved === false) {
    return { ...base, state: "output-denied", approval: { id: approval.id, approved: false } };
  }
  const approved = approval ? { approval: { id: approval.id, approved: true as const } } : {};
  return p.error
    ? { ...base, ...approved, state: "output-error", errorText: p.output ?? "" }
    : { ...base, ...approved, state: "output-available", output: p.output };
}

// Rebuild the UI messages useChat would have produced live, so a reloaded
// chat renders exactly like it did while streaming.
export function toChatMessages(stored: StoredMessage[]): ChatMessage[] {
  return stored
    .filter((m) => m.role === "user" || m.parts.length > 0)
    .map((m): ChatMessage => ({
      id: m.id,
      role: m.role,
      metadata: m.checkpoint_id ? { checkpointId: m.checkpoint_id } : undefined,
      parts: m.parts.flatMap((p): ChatMessage["parts"] => {
        switch (p.type) {
          case "reasoning":
          case "text":
            return [{ type: p.type, text: p.text, state: "done" }];
          case "suggestions":
            return [{ type: "data-suggestions", data: p.items }];
          case "tool":
            return p.approval
              ? [
                  toToolPart(p),
                  {
                    type: "data-expense-approval",
                    id: p.id,
                    data: { toolCallId: p.id, expense: p.approval.expense },
                  },
                ]
              : [toToolPart(p)];
        }
      }),
    }));
}
