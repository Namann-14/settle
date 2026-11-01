"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";

import { buttonClass } from "@/components/dashboard/panel";
import { useResetJoinLink } from "@/hooks/mutations";
import { useJoinLink } from "@/hooks/useGroup";

/** The group's shareable join link: anyone who opens it can join after signing in. */
export function JoinLinkCard({ groupId, groupName, isAdmin }: { groupId: string; groupName: string; isAdmin: boolean }) {
  const { data, isLoading, isError, refetch } = useJoinLink(groupId);
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
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-meta font-medium">Join link</h3>
        {isAdmin && data && (
          <button
            type="button"
            onClick={resetLink}
            disabled={reset.isPending}
            className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <RotateCcw className="size-3" />
            Reset link
          </button>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-9 w-full rounded-lg" />
      ) : isError || !data ? (
        <p className="text-xs text-muted-foreground">
          Couldn’t load the join link.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Try again
          </button>
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label="Join link"
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground outline-none focus-visible:border-ring sm:h-8"
          />
          <button type="button" onClick={copy} className={buttonClass({ size: "sm" })}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </button>
          {canShare && (
            <button
              type="button"
              onClick={share}
              aria-label="Share join link"
              className={buttonClass({ variant: "secondary", size: "sm", className: "w-11 px-0 sm:w-8" })}
            >
              <Share2 />
            </button>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Anyone with this link can join after signing in.</p>
    </div>
  );
}
