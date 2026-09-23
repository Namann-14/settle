import { ChatPanel } from "@/components/chat/chat-panel";
import { AiServiceError, aiFetchJson } from "@/lib/ai";
import { toChatMessages, type ChatMessage, type ChatThread } from "@/lib/chat-types";

async function loadMessages(id: string): Promise<ChatMessage[]> {
  try {
    const thread = await aiFetchJson<ChatThread>(`/chat/threads/${encodeURIComponent(id)}`);
    return toChatMessages(thread.messages);
  } catch (error) {
    // Not created yet (a new chat nobody has typed in) — or someone else's,
    // which the ai service also reports as 404 and refuses to continue.
    if (error instanceof AiServiceError && error.status === 404) return [];
    throw error;
  }
}

export default async function ChatThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  const initialPrompt = (Array.isArray(q) ? q[0] : q)?.trim() || undefined;

  return (
    <ChatPanel
      key={id}
      chatId={id}
      initialMessages={await loadMessages(id)}
      initialPrompt={initialPrompt}
      className="h-full"
    />
  );
}
