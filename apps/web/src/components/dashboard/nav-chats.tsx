"use client";

import { Trash2 } from "lucide-react";
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
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@settle/ui/components/sidebar";

// Chat history, below the main nav in the same sidebar (like Claude's
// "Chats and tasks"). Hidden when the sidebar collapses to icons, since a
// column of identical chat icons tells you nothing.
export function NavChats() {
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
        if (pathname === `/dashboard/chat/${thread.id}`) router.push("/dashboard");
      },
      onError: () => toast.error("Couldn't delete that chat"),
    });
  };

  return (
    <SidebarGroup className="min-h-0 flex-1 group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recents</SidebarGroupLabel>
      <SidebarMenu className="min-h-0 overflow-y-auto">
        {isPending &&
          Array.from({ length: 5 }, (_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        {isError && (
          <p className="px-2 text-xs text-muted-foreground">Couldn&apos;t load chats.</p>
        )}
        {threads?.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">No chats yet.</p>
        )}
        {threads?.map((thread) => {
          const href = `/dashboard/chat/${thread.id}` as const;
          return (
            <SidebarMenuItem key={thread.id}>
              <SidebarMenuButton render={<Link href={href} />} isActive={pathname === href}>
                <span className="truncate">{thread.title}</span>
              </SidebarMenuButton>
              <SidebarMenuAction
                showOnHover
                aria-label={`Delete chat "${thread.title}"`}
                onClick={() => setPendingDelete(thread)}
              >
                <Trash2 />
              </SidebarMenuAction>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

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
    </SidebarGroup>
  );
}
