import type { Route } from "next";
import { redirect } from "next/navigation";

// "New chat": mint an id and move to the chat's own URL straight away, so
// the id survives re-renders and refreshes. The thread itself is only
// created once a message is sent. ?q (from the dashboard's Ask AI card) is
// carried along for the chat page to send.
export default async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const prompt = (Array.isArray(q) ? q[0] : q)?.trim();
  const query = prompt ? `?q=${encodeURIComponent(prompt)}` : "";
  redirect(`/dashboard/chat/${crypto.randomUUID()}${query}` as Route);
}
