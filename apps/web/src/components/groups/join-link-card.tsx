"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";

import { useResetJoinLink } from "@/hooks/mutations";
import { useJoinLink } from "@/hooks/useGroup";

/** The group's shareable join link: anyone who opens it can join after signing in. */
export function JoinLinkCard({ groupId, groupName, isAdmin }: { groupId: string; groupName: string; isAdmin: boolean }) {
  const { data, isLoading, isError } = useJoinLink(groupId);
  const reset = useResetJoinLink(groupId);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // navigator only exists in the browser; checking after mount keeps SSR markup stable.
  useEffect(() => setCanShare(typeof navigator !== "undefined" && "share" in navigator), []);

  const url = data && typeof window !== "undefined" ? `${window.location.origin}/dashboard/join/${data.code}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it instead");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: `Join ${groupName} on Settle`, url });
    } catch {
      // dismissed the share sheet
    }
  };

  const resetLink = async () => {
    try {
      await reset.mutateAsync();
      toast.success("New link created. The old one no longer works");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reset the link");
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-3">
      <span className="flex items-center gap-1.5 text-xs tracking-[0.08em] text-muted-foreground uppercase">
        <Link2 className="size-3.5" />
        Join link
      </span>
      {isLoading ? (
        <Skeleton className="h-9 w-full rounded-lg" />
      ) : isError || !data ? (
        <p className="text-xs text-destructive">Couldn&rsquo;t load the join link.</p>
      ) : (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label="Join link"
            onFocus={(e) => e.currentTarget.select()}
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {canShare && (
            <button
              type="button"
              onClick={share}
              aria-label="Share join link"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <Share2 className="size-3.5" />
            </button>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Anyone with this link can join after signing in.</span>
        {isAdmin && data && (
          <button
            type="button"
            onClick={resetLink}
            disabled={reset.isPending}
            className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RotateCcw className="size-3" />
            Reset link
          </button>
        )}
      </div>
    </div>
  );
}
