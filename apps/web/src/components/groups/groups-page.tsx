"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import {
  FigureStrip,
  FigureStripSkeleton,
  PageContainer,
  PageHeader,
  Panel,
  SearchField,
  Segmented,
  buttonClass,
  type Figure,
} from "@/components/dashboard/panel";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettlements } from "@/hooks/useSettlements";
import { useStanding } from "@/hooks/useStanding";
import { formatMoney } from "@/lib/balances";
import { formatDay, initials } from "@/lib/people";
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

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Grid shared by the column header and each row so the columns line up.
// Below sm a row is just the name (with members and activity underneath)
// and the balance.
const rowGrid =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_8rem]";

export function GroupsPage() {
  const { data: me } = useCurrentUser();
  const { standing, groups, currency, isLoading, isError, retry } = useStanding();
  // Only for "last activity" and "most active"; balances come from the api.
  const { data: expenses } = useExpenses({ limit: 100 });
  const { data: settlements } = useSettlements({ limit: 100 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);

  const balanceOf = (g: Group) => standing?.groupNet.get(g.id)?.net ?? 0;

  // Latest expense or settlement date per group, from the recent items loaded.
  const lastActivity = useMemo(() => {
    const latest = new Map<string, string>();
    const bump = (groupId: string | null | undefined, date: string) => {
      if (!groupId) return;
      const current = latest.get(groupId);
      if (!current || date > current) latest.set(groupId, date);
    };
    for (const e of expenses ?? []) if (!e.deleted_at) bump(e.group_id, e.date);
    for (const s of settlements ?? []) bump(s.group_id, s.date);
    return latest;
  }, [expenses, settlements]);

  const figures = useMemo((): Figure[] | null => {
    if (!groups || !standing) return null;
    const people = new Set<string>();
    const net = new Map<string, number>();
    let ahead = 0;
    for (const g of groups) {
      for (const m of g.members) if (!m.removed_at && m.user_id !== me?.id) people.add(m.user_id);
      const entry = standing.groupNet.get(g.id);
      if (!entry) continue;
      net.set(entry.currency, (net.get(entry.currency) ?? 0) + entry.net);
      if (entry.net > 0.005) ahead++;
    }

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const counts = new Map<string, number>();
    for (const e of expenses ?? []) {
      if (e.group_id && !e.deleted_at && new Date(e.date) >= monthAgo) {
        counts.set(e.group_id, (counts.get(e.group_id) ?? 0) + 1);
      }
    }
    const [activeId, activeCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    const active = groups.find((g) => g.id === activeId);

    const netValues = [...net];
    const single = netValues.length === 1 ? netValues[0][1] : null;
    return [
      {
        label: "Net across groups",
        value:
          netValues.length === 0
            ? formatMoney(0, currency)
            : netValues.map(([c, amount]) => formatMoney(amount, c, { signed: true })).join(" + "),
        hint: `You’re ahead in ${ahead} of ${plural(groups.length, "group")}`,
        money: true,
        tone: single === null ? undefined : single > 0.005 ? "positive" : single < -0.005 ? "negative" : "muted",
      },
      {
        label: "Most active",
        value: active?.name ?? "None yet",
        hint: active ? `${plural(activeCount ?? 0, "expense")} in the last 30 days` : "No expenses in the last 30 days",
      },
      {
        label: "People you split with",
        value: people.size,
        hint: "Across all your groups",
      },
    ];
  }, [groups, standing, expenses, me, currency]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (groups ?? []).filter(
      (g) =>
        (!q || g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) &&
        (filter === "all" || status(standing?.groupNet.get(g.id)?.net ?? 0) === filter),
    );
  }, [groups, standing, query, filter]);

  const hasGroups = (groups ?? []).length > 0;

  let body: React.ReactNode;
  if (isLoading) body = <GroupsListSkeleton />;
  else if (isError || !standing) {
    body = (
      <Panel>
        <p className="text-sm text-muted-foreground">
          Couldn’t load your groups.{" "}
          <button
            type="button"
            onClick={retry}
            className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Try again
          </button>
        </p>
      </Panel>
    );
  } else if (!hasGroups) {
    body = (
      <Panel className="items-start">
        <p className="text-sm text-muted-foreground">
          No groups yet. Start one for a trip, a flat or anything you share.
        </p>
        <button type="button" onClick={() => setCreating(true)} className={buttonClass({ size: "sm" })}>
          <Plus />
          New group
        </button>
      </Panel>
    );
  } else {
    body = (
      <Panel className="animate-fade-in gap-0 py-2 md:py-2">
        <div
          aria-hidden
          className={cn(rowGrid, "hidden border-b border-border py-2.5 text-xs text-muted-foreground sm:grid")}
        >
          <span>Group</span>
          <span>Members</span>
          <span>Last activity</span>
          <span className="text-right">Your balance</span>
        </div>
        {visible.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No groups match. Try another search or filter.</p>
        ) : (
          <ul className="flex flex-col">
            {visible.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                balance={balanceOf(group)}
                currency={standing.groupNet.get(group.id)?.currency ?? group.default_currency}
                lastActivity={lastActivity.get(group.id)}
              />
            ))}
          </ul>
        )}
      </Panel>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Groups"
        description="Everyone you split with, and where each group stands."
        actions={
          <button type="button" onClick={() => setCreating(true)} className={buttonClass()}>
            <Plus />
            New group
          </button>
        }
      />

      {isLoading ? (
        <FigureStripSkeleton count={3} />
      ) : (
        figures && hasGroups && <FigureStrip figures={figures} className="animate-fade-in" />
      )}

      {hasGroups && !isError && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search groups"
            icon={<Search className="size-4" />}
            className="sm:flex-1"
          />
          <Segmented options={FILTERS} value={filter} onChange={setFilter} label="Filter groups by balance" />
        </div>
      )}

      {body}

      <CreateGroupDialog open={creating} onOpenChange={setCreating} />
    </PageContainer>
  );
}

function GroupRow({
  group,
  balance,
  currency,
  lastActivity,
}: {
  group: Group;
  balance: number;
  currency: string;
  lastActivity?: string;
}) {
  const members = group.members.filter((m) => !m.removed_at).length;
  const state = status(balance);
  const activity = lastActivity ? formatDay(lastActivity) : "No recent activity";

  return (
    <li className="border-b border-border/50 last:border-b-0">
      <Link
        href={`/dashboard/groups/${group.id}`}
        className={cn(
          rowGrid,
          "-mx-2 min-h-14 rounded-lg px-2 py-3 text-sm outline-none transition-colors duration-150 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-micro font-semibold text-primary"
          >
            {initials(group.name)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{group.name}</span>
            <span className="truncate text-xs text-muted-foreground sm:hidden">
              {plural(members, "member")} · {activity}
            </span>
            {group.description && (
              <span className="hidden truncate text-xs text-muted-foreground sm:block">{group.description}</span>
            )}
          </span>
        </span>
        <span className="hidden text-muted-foreground tabular-nums sm:block">{members}</span>
        <span className="hidden text-muted-foreground sm:block">{activity}</span>
        <span
          className={cn(
            "text-right font-medium tabular-nums",
            state === "owed" && "text-primary",
            state === "owe" && "text-destructive",
            state === "settled" && "font-normal text-muted-foreground",
          )}
        >
          {state === "settled" ? "Settled" : formatMoney(balance, currency, { signed: true })}
        </span>
      </Link>
    </li>
  );
}

function GroupsListSkeleton() {
  return (
    <div aria-busy aria-label="Loading groups" className="flex flex-col rounded-2xl border border-border bg-card px-5 py-2 md:px-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-1/3 rounded-full" />
            <Skeleton className="h-3 w-1/5 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
