import type { UIMessage } from "ai";

// Shared by the /api/chat route (which writes these) and the chat UI (which
// reads them), so both agree on the shape of metadata and data parts.
export type ChatMessageMetadata = {
  // LangGraph checkpoint the thread was at after this assistant turn; sent
  // back on the next request so restoring a checkpoint forks from here.
  checkpointId?: string;
};

export type ChatDataParts = {
  suggestions: string[];
};

export type ChatMessage = UIMessage<ChatMessageMetadata, ChatDataParts>;

// Chat history as the ai service stores it (services/ai/app/db/chat_store.py).
export type StoredPart =
  | { type: "reasoning" | "text"; text: string }
  | { type: "tool"; id: string; name: string; args: unknown; output: string | null; error: boolean }
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

// Rebuild the UI messages useChat would have produced live, so a reloaded
// chat renders exactly like it did while streaming.
export function toChatMessages(stored: StoredMessage[]): ChatMessage[] {
  return stored
    .filter((m) => m.role === "user" || m.parts.length > 0)
    .map((m): ChatMessage => ({
      id: m.id,
      role: m.role,
      metadata: m.checkpoint_id ? { checkpointId: m.checkpoint_id } : undefined,
      parts: m.parts.map((p): ChatMessage["parts"][number] => {
        switch (p.type) {
          case "reasoning":
          case "text":
            return { type: p.type, text: p.text, state: "done" };
          case "suggestions":
            return { type: "data-suggestions", data: p.items };
          case "tool":
            return p.error
              ? {
                  type: "dynamic-tool",
                  toolCallId: p.id,
                  toolName: p.name,
                  state: "output-error",
                  input: p.args,
                  errorText: p.output ?? "",
                }
              : {
                  type: "dynamic-tool",
                  toolCallId: p.id,
                  toolName: p.name,
                  state: "output-available",
                  input: p.args,
                  output: p.output,
                };
        }
      }),
    }));
}
