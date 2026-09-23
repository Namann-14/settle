// Shared by /dashboard/chat (new chat) and /dashboard/chat/[id]. Chat history
// lives in the app sidebar, so this only sizes the panel: 100svh minus the
// h-16 topbar and the dashboard layout's p-4 padding, so the conversation
// scrolls inside the panel instead of the whole page.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-[calc(100svh-6rem)] min-w-0 flex-col">{children}</div>;
}
