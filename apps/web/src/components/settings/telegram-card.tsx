"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button, buttonVariants } from "@settle/ui/components/button";
import { Skeleton } from "@settle/ui/components/skeleton";

import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCreateTelegramLinkCode, useUnlinkTelegram } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { TelegramLinkCode } from "@/types";

// tg:// opens the Telegram app directly, so linking still works where t.me is blocked.
function appLink(link: TelegramLinkCode) {
  return link.bot_username ? `tg://resolve?domain=${link.bot_username}&start=${link.code}` : null;
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

export function TelegramCard() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useCurrentUser();
  const createCode = useCreateTelegramLinkCode();
  const unlink = useUnlinkTelegram();
  const [link, setLink] = useState<TelegramLinkCode | null>(null);
  const secondsLeft = useSecondsLeft(link?.expires_at);
  const linked = Boolean(me?.telegram_linked);
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
      toast.success("Telegram linked");
    }
  }, [linked, link]);

  const connect = () =>
    createCode.mutate(undefined, {
      onSuccess: (code) => {
        setLink(code);
        // Open the Telegram app straight away; the card keeps fallbacks in case nothing happens.
        const url = appLink(code);
        if (url) window.location.href = url;
      },
      onError: (err) => toast.error(err.message),
    });

  const disconnect = () =>
    unlink.mutate(undefined, {
      onSuccess: () => toast.success("Telegram unlinked"),
      onError: (err) => toast.error(err.message),
    });

  return (
    <Panel>
      <PanelHeader
        title="Telegram"
        description="Log expenses by messaging the Settle bot — type “lunch 250” or send a voice note."
      />

      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : linked ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              Linked{me?.telegram_username ? ` to @${me.telegram_username}` : ""}
            </span>
            <span className="text-[13px] text-muted-foreground">
              Send <b>/help</b> to the bot to see what it can do.
            </span>
          </div>
          <Button variant="destructive" size="sm" onClick={disconnect} disabled={unlink.isPending}>
            {unlink.isPending ? "Unlinking…" : "Unlink"}
          </Button>
        </div>
      ) : waiting && link ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 p-4">
          <p className="text-[13px] text-muted-foreground">
            Tap <b>Start</b> in Telegram to finish linking.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {appLink(link) && (
              <a className={buttonVariants({ size: "sm" })} href={appLink(link)!}>
                Open Telegram app
              </a>
            )}
            {link.deep_link && (
              <a
                className={buttonVariants({ size: "sm", variant: "outline" })}
                href={link.deep_link}
                target="_blank"
                rel="noreferrer"
              >
                Open in browser
              </a>
            )}
            <span className="text-[13px] text-muted-foreground">
              Expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")} · waiting…
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Nothing opened? In Telegram, search <b>@{link.bot_username ?? "the Settle bot"}</b> and send{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/start {link.code}</code>
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
          <span className="text-[13px] text-muted-foreground">
            {link ? "That link expired. Try again." : "Not linked yet."}
          </span>
          <Button size="sm" onClick={connect} disabled={createCode.isPending}>
            {createCode.isPending ? "Opening…" : "Connect Telegram"}
          </Button>
        </div>
      )}
    </Panel>
  );
}
