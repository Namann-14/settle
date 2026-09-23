import { ChatHistory } from "@/components/chat/chat-history";

// Shared by /dashboard/chat (new chat) and /dashboard/chat/[id], so the
// history list stays mounted while switching between chats.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  // 100svh minus the h-16 topbar and the dashboard layout's p-4 padding, so
  // the conversation scrolls inside the panel instead of the whole page.
  return (
    <div className="flex h-[calc(100svh-6rem)] gap-4">
      <ChatHistory className="hidden w-60 shrink-0 md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
