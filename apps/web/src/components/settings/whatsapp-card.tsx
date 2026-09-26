"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button, buttonVariants } from "@settle/ui/components/button";
import { Skeleton } from "@settle/ui/components/skeleton";

import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCreateWhatsAppLinkCode, useUnlinkWhatsApp } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { WhatsAppLinkCode } from "@/types";

// WhatsApp sends numbers as bare digits with the country code, e.g. 919876543210.
function maskPhone(phone: string) {
  const tail = phone.slice(-3);
  const country = phone.length > 10 ? phone.slice(0, phone.length - 10) : "";
  return `${country ? `+${country} ` : ""}••••••${tail}`;
}

function useSecondsLeft(expiresAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return 0;
  return Math.max(0, Math.round((new Date(expiresAt).getTime() - now) / 1000));
}

export function WhatsAppCard() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useCurrentUser();
  const createCode = useCreateWhatsAppLinkCode();
  const unlink = useUnlinkWhatsApp();
  const [link, setLink] = useState<WhatsAppLinkCode | null>(null);
  const secondsLeft = useSecondsLeft(link?.expires_at);
  const linked = Boolean(me?.whatsapp_phone);
  const waiting = Boolean(link) && secondsLeft > 0 && !linked;

  // While a code is live, poll the profile so the card flips to "linked" on its own.
  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(() => queryClient.invalidateQueries({ queryKey: ["currentUser"] }), 3000);
    return () => clearInterval(id);
  }, [waiting, queryClient]);

  useEffect(() => {
    if (linked && link) {
      setLink(null);
      toast.success("WhatsApp linked");
    }
  }, [linked, link]);

  const generate = () =>
    createCode.mutate(undefined, {
      onSuccess: setLink,
      onError: (err) => toast.error(err.message),
    });

  const disconnect = () =>
    unlink.mutate(undefined, {
      onSuccess: () => toast.success("WhatsApp unlinked"),
      onError: (err) => toast.error(err.message),
    });

  return (
    <Panel>
      <PanelHeader
        title="WhatsApp"
        description="Log expenses by messaging the Settle bot — type “lunch 250” or send a voice note."
      />

      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : linked ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Linked to {maskPhone(me!.whatsapp_phone!)}</span>
            <span className="text-[13px] text-muted-foreground">
              Send <b>help</b> to the bot to see what it can do.
            </span>
          </div>
          <Button variant="destructive" size="sm" onClick={disconnect} disabled={unlink.isPending}>
            {unlink.isPending ? "Unlinking…" : "Unlink"}
          </Button>
        </div>
      ) : waiting && link ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border/70 p-4">
          <p className="text-[13px] text-muted-foreground">Send this message to the Settle bot on WhatsApp:</p>
          <code className="self-start rounded-lg bg-muted px-3 py-2 font-mono text-lg tracking-[0.2em]">
            LINK {link.code}
          </code>
          <div className="flex flex-wrap items-center gap-3">
            {link.bot_number && (
              <a
                className={buttonVariants({ size: "sm" })}
                href={`https://wa.me/${link.bot_number}?text=${encodeURIComponent(`LINK ${link.code}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Open WhatsApp
              </a>
            )}
            <span className="text-[13px] text-muted-foreground">
              Expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")} · waiting for
              your message…
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
          <span className="text-[13px] text-muted-foreground">
            {link ? "That code expired. Generate a new one." : "Not linked yet."}
          </span>
          <Button size="sm" onClick={generate} disabled={createCode.isPending}>
            {createCode.isPending ? "Generating…" : "Generate code"}
          </Button>
        </div>
      )}
    </Panel>
  );
}
