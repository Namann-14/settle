"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { Empty, EmptyDescription, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";

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

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError || !preview ? (
        <Empty className="rounded-2xl border border-border/70 bg-card py-16">
          <EmptyTitle>Link not valid</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error ? error.message : "This join link is invalid or has been reset."}
          </EmptyDescription>
          <Link href="/dashboard/groups" className="text-sm font-medium text-primary hover:underline">
            Go to your groups
          </Link>
        </Empty>
      ) : (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/70 bg-card p-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-xl font-semibold text-primary">
            {initials(preview.name)}
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs tracking-[0.08em] text-muted-foreground uppercase">You&rsquo;re invited to join</span>
            <h1 className="font-display text-4xl leading-none tracking-tight">{preview.name}</h1>
            {preview.description && <p className="text-sm text-muted-foreground">{preview.description}</p>}
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-3.5" />
              {preview.member_count} {preview.member_count === 1 ? "member" : "members"}
            </p>
          </div>
          {preview.already_member ? (
            <Link
              href={`/dashboard/groups/${preview.group_id}`}
              className="flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              You&rsquo;re already in this group · Open it
            </Link>
          ) : (
            <div className="flex gap-2.5">
              <Link
                href="/dashboard/groups"
                className="flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium hover:bg-muted"
              >
                Not now
              </Link>
              <button
                type="button"
                onClick={submit}
                disabled={join.isPending}
                className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md disabled:opacity-50"
              >
                {join.isPending ? "Joining…" : "Join group"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
