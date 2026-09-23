"use client";

import { MessageSquare, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useChatThreads, useDeleteChatThread } from "@/hooks/useChatThreads";
import type { ChatThreadSummary } from "@/lib/chat-types";
import { Button } from "@settle/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@settle/ui/components/dialog";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (minutes > -1) return "just now";
  if (minutes > -60) return relativeTime.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relativeTime.format(hours, "hour");
  return relativeTime.format(Math.round(hours / 24), "day");
}

export function ChatHistory({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: threads, isPending, isError } = useChatThreads();
  const deleteThread = useDeleteChatThread();
  const [pendingDelete, setPendingDelete] = useState<ChatThreadSummary | null>(null);

  const confirmDelete = () => {
    const thread = pendingDelete;
    if (!thread) return;
    deleteThread.mutate(thread.id, {
      onSuccess: () => {
        setPendingDelete(null);
        if (pathname === `/dashboard/chat/${thread.id}`) router.push("/dashboard/chat");
      },
      onError: () => toast.error("Couldn't delete that chat"),
    });
  };

  return (
    <aside className={cn("flex min-h-0 flex-col gap-2 border-r pr-3", className)}>
      <Button
        variant="outline"
        className="justify-start"
        nativeButton={false}
        render={<Link href="/dashboard/chat" />}
      >
        <SquarePen />
        New chat
      </Button>

      <p className="px-2 pt-2 text-xs font-medium text-muted-foreground">Recent</p>
      <nav className="-mr-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-3">
        {isPending &&
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}
        {isError && (
          <p className="px-2 text-xs text-muted-foreground">Couldn&apos;t load chats.</p>
        )}
        {threads?.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">No chats yet.</p>
        )}
        {threads?.map((thread) => {
          const href = `/dashboard/chat/${thread.id}` as const;
          const active = pathname === href;
          return (
            <div
              key={thread.id}
              className={cn(
                "group/thread flex items-center gap-1 rounded-md pr-1 text-sm hover:bg-muted",
                active && "bg-muted"
              )}
            >
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5"
              >
                <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{thread.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {timeAgo(thread.updated_at)}
                  </span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete chat "${thread.title}"`}
                className="opacity-0 group-hover/thread:opacity-100 focus-visible:opacity-100"
                onClick={() => setPendingDelete(thread)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </nav>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              &ldquo;{pendingDelete?.title}&rdquo; and its history will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteThread.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
