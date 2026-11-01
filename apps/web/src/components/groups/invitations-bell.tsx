"use client";

import { useRouter } from "next/navigation";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@settle/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@settle/ui/components/popover";

import { buttonClass } from "@/components/dashboard/panel";
import { useRespondToInvitation } from "@/hooks/mutations";
import { useMyInvitations } from "@/hooks/useInvitations";
import { initials } from "@/lib/people";

/** Topbar inbox: group invites waiting for the user to accept or decline. */
export function InvitationsBell() {
  const router = useRouter();
  const { data: invitations } = useMyInvitations();
  const respond = useRespondToInvitation();
  const count = invitations?.length ?? 0;

  const answer = async (id: string, action: "accept" | "decline", groupId: string, name?: string | null) => {
    try {
      await respond.mutateAsync({ id, action });
      if (action === "accept") {
        toast.success(`You joined ${name ?? "the group"}`);
        router.push(`/dashboard/groups/${groupId}`);
      } else {
        toast.success("Invite declined");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't answer that invite");
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full border border-border bg-card"
            aria-label={count ? `${count} pending group ${count === 1 ? "invite" : "invites"}` : "Notifications"}
          />
        }
      >
        <Bell />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-micro font-semibold text-primary-foreground">
            {count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border/70 px-4 py-3 text-sm font-medium">Group invites</div>
        {count === 0 ? (
          <p className="px-4 py-5 text-meta text-muted-foreground">No pending invites. When someone adds you to a group, it shows up here.</p>
        ) : (
          <ul className="flex max-h-80 flex-col overflow-y-auto">
            {invitations!.map((inv) => (
              <li key={inv.id} className="flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-b-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-primary">
                  {initials(inv.group_name)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-meta leading-snug">
                    <span className="font-medium">{inv.invited_by_name ?? "Someone"}</span> invited you to{" "}
                    <span className="font-medium">{inv.group_name ?? "a group"}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={respond.isPending}
                      onClick={() => answer(inv.id, "accept", inv.group_id, inv.group_name)}
                      className={buttonClass({ size: "sm" })}
                    >
                      <Check />
                      Join
                    </button>
                    <button
                      type="button"
                      disabled={respond.isPending}
                      onClick={() => answer(inv.id, "decline", inv.group_id)}
                      className={buttonClass({ variant: "ghost", size: "sm" })}
                    >
                      <X />
                      Decline
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
