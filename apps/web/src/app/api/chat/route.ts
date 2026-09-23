import { NextResponse } from "next/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";
import { aiErrorStatus, aiFetch } from "@/lib/ai";
import type { ChatMessage } from "@/lib/chat-types";

// Events emitted by the ai service's POST /chat/stream (see
// services/ai/app/routes/chat.py). Translated here into the AI SDK UI
// message stream so the client can use useChat + ai-elements directly.
type AiServiceEvent =
  | { conversation_id: string }
  | { reasoning: string }
  | { delta: string }
  | { tool_call: { id: string; name: string; args: unknown } }
  | { tool_result: { id: string; name: string; output: string; error?: boolean } }
  | { checkpoint_id: string }
  | { suggestions: string[] };

async function* readSseEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = raw
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data) continue;
      if (data === "[DONE]") return;
      yield JSON.parse(data) as AiServiceEvent;
    }
  }
}

function lastUserText(messages: ChatMessage[]): string {
  const last = messages.findLast((m) => m.role === "user");
  return (last?.parts ?? [])
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export async function POST(request: Request) {
  const { id, messages } = (await request.json()) as {
    id: string;
    messages: ChatMessage[];
  };

  const message = lastUserText(messages);
  if (!message) {
    return NextResponse.json({ message: "Empty message" }, { status: 400 });
  }

  // Resume from the checkpoint of the latest assistant turn the client still
  // has. Normally that's the thread head anyway; after "Restore checkpoint"
  // truncates the conversation, it makes the server fork from that point too.
  const checkpointId = messages.findLast((m) => m.role === "assistant")?.metadata
    ?.checkpointId;

  let upstream: Response;
  try {
    // The chat id doubles as the LangGraph thread id, so memory for the
    // conversation lives server-side and only the newest message is sent.
    upstream = await aiFetch("/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: id,
        checkpoint_id: checkpointId ?? null,
      }),
      signal: request.signal,
    });
  } catch (error) {
    console.error(error);
    const text = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ message: text }, { status: aiErrorStatus(error) });
  }

  const stream = createUIMessageStream<ChatMessage>({
    execute: async ({ writer }) => {
      // At most one text or reasoning part is open at a time; switching kind
      // (or a tool call) closes the open one, so parts keep stream order.
      let open: { kind: "text" | "reasoning"; id: string } | null = null;
      const close = () => {
        if (open) writer.write({ type: `${open.kind}-end`, id: open.id });
        open = null;
      };
      const append = (kind: "text" | "reasoning", delta: string) => {
        if (open?.kind !== kind) {
          close();
          open = { kind, id: generateId() };
          writer.write({ type: `${kind}-start`, id: open.id });
        }
        writer.write({ type: `${kind}-delta`, id: open.id, delta });
      };
      writer.write({ type: "start" });
      for await (const event of readSseEvents(upstream.body!)) {
        if ("reasoning" in event) {
          append("reasoning", event.reasoning);
        } else if ("delta" in event) {
          append("text", event.delta);
        } else if ("tool_call" in event) {
          close();
          writer.write({
            type: "tool-input-available",
            toolCallId: event.tool_call.id,
            toolName: event.tool_call.name,
            input: event.tool_call.args,
            dynamic: true,
          });
        } else if ("tool_result" in event) {
          const { id: toolCallId, output, error } = event.tool_result;
          writer.write(
            error
              ? { type: "tool-output-error", toolCallId, errorText: output, dynamic: true }
              : { type: "tool-output-available", toolCallId, output, dynamic: true }
          );
        } else if ("checkpoint_id" in event) {
          close();
          writer.write({
            type: "message-metadata",
            messageMetadata: { checkpointId: event.checkpoint_id },
          });
        } else if ("suggestions" in event) {
          writer.write({ type: "data-suggestions", data: event.suggestions });
        }
      }
      close();
      writer.write({ type: "finish" });
    },
    onError: (error) => {
      console.error(error);
      return "The assistant ran into a problem. Please try again.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
