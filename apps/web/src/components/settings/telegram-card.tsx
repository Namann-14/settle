"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";

import { Panel, PanelHeader, buttonClass } from "@/components/dashboard/panel";
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

  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <Panel>
      <PanelHeader
        title="Telegram"
        description="Log expenses by messaging the Settle bot. Type “lunch 250” or send a voice note."
      />

      {isLoading ? (
        <div aria-busy className="flex items-center justify-between gap-4 py-1">
          <Skeleton className="h-3.5 w-48 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ) : linked ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="truncate">
                Linked{me?.telegram_username ? ` to @${me.telegram_username}` : ""}
              </span>
            </span>
            <span className="text-meta text-muted-foreground">
              Send <b className="font-medium text-foreground">/help</b> to the bot to see what it can do.
            </span>
          </div>
          <button
            type="button"
            onClick={disconnect}
            disabled={unlink.isPending}
            className={buttonClass({ variant: "danger", size: "sm", className: "self-start sm:self-auto" })}
          >
            {unlink.isPending ? "Unlinking…" : "Unlink"}
          </button>
        </div>
      ) : waiting && link ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Tap <b className="font-medium">Start</b> in Telegram to finish linking.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {appLink(link) && (
              <a className={buttonClass({ size: "sm" })} href={appLink(link)!}>
                Open Telegram app
              </a>
            )}
            {link.deep_link && (
              <a
                className={buttonClass({ variant: "secondary", size: "sm" })}
                href={link.deep_link}
                target="_blank"
                rel="noreferrer"
              >
                Open in browser
              </a>
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              Expires in {countdown} · waiting…
            </span>
          </div>
          <p className="border-t border-border/50 pt-3 text-meta text-muted-foreground">
            Nothing opened? In Telegram, search <b className="font-medium text-foreground">@{link.bot_username ?? "the Settle bot"}</b> and send{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">/start {link.code}</code>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-meta text-muted-foreground">
            {link ? "That link expired. Try again." : "Not linked yet."}
          </span>
          <button
            type="button"
            onClick={connect}
            disabled={createCode.isPending}
            className={buttonClass({ size: "sm", className: "self-start sm:self-auto" })}
          >
            {createCode.isPending ? "Opening…" : "Connect Telegram"}
          </button>
        </div>
      )}
    </Panel>
  );
}
