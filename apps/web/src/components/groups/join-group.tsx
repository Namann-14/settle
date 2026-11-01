"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";

import { PageContainer, Panel, buttonClass } from "@/components/dashboard/panel";
import { useJoinGroup } from "@/hooks/mutations";
import { useJoinPreview } from "@/hooks/useGroup";
import { initials } from "@/lib/people";

/** Landing page for a shared join link: shows the group, then joins on confirm. */
export function JoinGroup({ code }: { code: string }) {
  const router = useRouter();
  const { data: preview, isLoading, isError, error } = useJoinPreview(code);
  const join = useJoinGroup();

  const submit = async () => {
    try {
      const group = await join.mutateAsync(code);
      toast.success(`You joined ${group.name}`);
      router.replace(`/dashboard/groups/${group.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't join the group");
    }
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <Panel aria-busy aria-label="Loading invite" className="gap-5 py-6 md:py-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-5 w-40 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </Panel>
    );
  } else if (isError || !preview) {
    body = (
      <Panel className="items-start gap-3 py-6 md:py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">This link doesn’t work</h1>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "It’s invalid or has been reset."} Ask the person who shared it
            for a new one.
          </p>
        </div>
        <Link href="/dashboard/groups" className={buttonClass({ variant: "secondary", size: "sm" })}>
          Go to your groups
        </Link>
      </Panel>
    );
  } else {
    body = (
      <Panel className="animate-fade-in gap-5 py-6 md:py-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-semibold text-primary"
          >
            {initials(preview.name)}
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="text-meta text-muted-foreground">You’re invited to join</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight">{preview.name}</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {preview.member_count} {preview.member_count === 1 ? "member" : "members"}
          {preview.description ? ` · ${preview.description}` : ""}
        </p>
        {preview.already_member ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm">You’re already in this group.</p>
            <Link href={`/dashboard/groups/${preview.group_id}`} className={buttonClass()}>
              Open group
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={submit} disabled={join.isPending} className={buttonClass()}>
              {join.isPending ? "Joining…" : "Join group"}
            </button>
            <Link href="/dashboard/groups" className={buttonClass({ variant: "ghost" })}>
              Not now
            </Link>
          </div>
        )}
      </Panel>
    );
  }

  return (
    <PageContainer className="max-w-md pt-10 md:pt-16">
      {body}
    </PageContainer>
  );
}
