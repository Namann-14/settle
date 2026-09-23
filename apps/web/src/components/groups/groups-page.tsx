"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Eyebrow } from "@/components/dashboard/panel";
import { StatSkeleton } from "@/components/dashboard/overview-skeleton";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { useSettlements } from "@/hooks/useSettlements";
import { computeBalances, formatMoney } from "@/lib/balances";
import { initials } from "@/lib/people";
import type { Group } from "@/types";

type Filter = "all" | "owed" | "owe" | "settled";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "owed", label: "You’re owed" },
  { id: "owe", label: "You owe" },
  { id: "settled", label: "Settled" },
];

const status = (balance: number): Exclude<Filter, "all"> =>
  balance > 0.005 ? "owed" : balance < -0.005 ? "owe" : "settled";

export function GroupsPage() {
  const { data: groups, isLoading, isError } = useGroups();
  const { data: me } = useCurrentUser();
  const { data: expenses } = useExpenses({ limit: 100 });
  const { data: settlements } = useSettlements({ limit: 100 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);

  const byGroup = useMemo(
    () => (me ? computeBalances(expenses ?? [], settlements ?? [], me.id).byGroup : new Map()),
    [expenses, settlements, me],
  );

  const stats = useMemo(() => {
    if (!groups) return null;
    const people = new Set<string>();
    let net = 0;
    let ahead = 0;
    for (const g of groups) {
      for (const m of g.members) if (!m.removed_at && m.user_id !== me?.id) people.add(m.user_id);
      const b = byGroup.get(g.id) ?? 0;
      net += b;
      if (b > 0.005) ahead++;
    }
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const counts = new Map<string, number>();
    for (const e of expenses ?? []) {
      if (e.group_id && new Date(e.date) >= monthAgo) {
        counts.set(e.group_id, (counts.get(e.group_id) ?? 0) + 1);
      }
    }
    const [activeId, activeCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    return {
      people: people.size,
      net,
      ahead,
      active: groups.find((g) => g.id === activeId),
      activeCount: activeCount ?? 0,
    };
  }, [groups, byGroup, expenses, me]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (groups ?? []).filter(
      (g) =>
        (!q || g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) &&
        (filter === "all" || status(byGroup.get(g.id) ?? 0) === filter),
    );
  }, [groups, query, filter, byGroup]);

  const currency = me?.default_currency ?? "INR";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Eyebrow>
            {groups
              ? `${groups.length} ${groups.length === 1 ? "group" : "groups"} · ${stats?.people ?? 0} people`
              : "Groups"}
          </Eyebrow>
          <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
            Your <em className="italic">groups</em>
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Everyone you split with, and where each group stands.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] sm:self-auto"
        >
          <Plus className="size-4" />
          New group
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {!stats ? (
          <>
            <StatSkeleton highlight />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2.5 rounded-2xl bg-primary p-5 text-primary-foreground shadow-[0_25px_80px_-12px_rgba(46,89,70,0.35)]">
              <Eyebrow className="text-primary-foreground/70">Net across groups</Eyebrow>
              <span className="font-display text-4xl leading-none tracking-tight lg:text-[44px]">
                {formatMoney(stats.net, currency, { signed: true })}
              </span>
              <span className="text-[13px] text-primary-foreground/80">
                You’re ahead in {stats.ahead} of {groups?.length ?? 0}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-card p-5">
              <Eyebrow>Most active</Eyebrow>
              <span className="truncate font-display text-4xl leading-none tracking-tight lg:text-[44px]">
                {stats.active?.name ?? "None yet"}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {stats.activeCount} {stats.activeCount === 1 ? "expense" : "expenses"} in the last
                30 days
              </span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-card p-5">
              <Eyebrow>People you split with</Eyebrow>
              <span className="font-display text-4xl leading-none tracking-tight lg:text-[44px]">
                {stats.people}
              </span>
              <span className="text-[13px] text-muted-foreground">Across all your groups</span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 text-sm text-muted-foreground focus-within:border-ring">
          <Search className="size-4" />
          <span className="sr-only">Search groups</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups"
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-9 shrink-0 rounded-[9px] px-3.5 text-[13px] transition-colors",
                filter === f.id
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[214px] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Empty className="rounded-2xl border border-border/70 bg-card py-14">
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load groups</EmptyTitle>
          <EmptyDescription>Try refreshing the page.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              meId={me?.id}
              balance={byGroup.get(group.id) ?? 0}
            />
          ))}
          {filter === "all" && !query && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex min-h-[214px] flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-card"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-muted text-primary">
                <Plus className="size-5" />
              </span>
              <span className="font-medium text-foreground">Create a group</span>
              <span>Trips, flats, dinners: anything you share</span>
            </button>
          )}
          {visible.length === 0 && (filter !== "all" || query) && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No groups match.
            </p>
          )}
        </div>
      )}

      <CreateGroupDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}

const AVATAR_TONES = ["bg-primary text-primary-foreground", "bg-secondary", "bg-accent"];

function GroupCard({ group, meId, balance }: { group: Group; meId?: string; balance: number }) {
  const members = group.members.filter((m) => !m.removed_at);
  // Current user first, so the stack always starts with "you".
  members.sort((a, b) => Number(b.user_id === meId) - Number(a.user_id === meId));
  const state = status(balance);

  return (
    <Link
      href={`/dashboard/groups/${group.id}`}
      className="group flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-5.5 transition-all hover:-translate-y-0.5 hover:shadow-dashboard"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-primary">
          {initials(group.name)}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            state === "owed" && "bg-primary/10 text-primary",
            state === "owe" && "bg-destructive/10 text-destructive",
            state === "settled" && "bg-muted text-muted-foreground",
          )}
        >
          {state === "owed" ? "You’re owed" : state === "owe" ? "You owe" : "Settled"}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[17px] font-semibold">{group.name}</span>
        <span className="line-clamp-1 text-[13px] text-muted-foreground">
          {group.description || `${members.length} ${members.length === 1 ? "member" : "members"}`}
        </span>
      </div>
      <div className="mt-auto flex items-end justify-between border-t border-border/50 pt-3.5">
        <div className="flex">
          {members.slice(0, 3).map((m, i) => (
            <span
              key={m.id}
              title={m.user_name ?? m.user_email ?? undefined}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border-2 border-card text-[11px] font-medium",
                AVATAR_TONES[i % AVATAR_TONES.length],
                i > 0 && "-ml-2",
              )}
            >
              {initials(m.user_name ?? m.user_email)}
            </span>
          ))}
          {members.length > 3 && (
            <span className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] text-muted-foreground">
              +{members.length - 3}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-muted-foreground">Your balance</span>
          <span
            className={cn(
              "text-lg font-semibold",
              state === "owed" && "text-primary",
              state === "owe" && "text-destructive",
              state === "settled" && "text-muted-foreground",
            )}
          >
            {state === "settled"
              ? "Settled up"
              : formatMoney(balance, group.default_currency, { signed: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}
