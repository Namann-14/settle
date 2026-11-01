"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Panel, PanelHeader, rowClass } from "@/components/dashboard/panel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { useSettlements } from "@/hooks/useSettlements";
import { useStanding } from "@/hooks/useStanding";
import { formatMoney } from "@/lib/balances";
import { buildNameMap, displayName, formatDay, num } from "@/lib/people";

// The two quieter lists under the overview ledger: where the user stands in
// each group, and the latest expenses and settlements in one feed.

const ACTIVITY_PARAMS = { limit: 8 };
const ACTIVITY_ROWS = 6;

function ListPanel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: Route;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="gap-1">
      <PanelHeader
        title={title}
        action={
          <Link
            href={href}
            className="rounded-md text-xs text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {linkLabel}
          </Link>
        }
      />
      {children}
    </Panel>
  );
}


function RowsSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-busy className="flex flex-col">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={rowClass}>
          <Skeleton className="h-3.5 w-2/5 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function Retry({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <p className="py-3 text-sm text-muted-foreground">
      Couldn’t load {what}.{" "}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Try again
      </button>
    </p>
  );
}

export function GroupsList() {
  const { standing, groups, isLoading, isError, retry } = useStanding();

  return (
    <ListPanel title="Groups" href="/dashboard/groups" linkLabel="All groups">
      {isLoading ? (
        <RowsSkeleton rows={3} />
      ) : isError || !standing ? (
        <Retry what="your groups" onRetry={retry} />
      ) : (groups ?? []).length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">No groups yet.</p>
      ) : (
        <ul className="flex flex-col">
          {(groups ?? []).map((group) => {
            const entry = standing.groupNet.get(group.id);
            const net = entry?.net ?? 0;
            return (
              <li key={group.id}>
                <Link
                  href={`/dashboard/groups/${group.id}`}
                  className={cn(rowClass, "-mx-2 rounded-lg px-2 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50")}
                >
                  <span className="truncate font-medium">{group.name}</span>
                  {Math.abs(net) < 0.005 ? (
                    <span className="text-muted-foreground">Settled</span>
                  ) : (
                    <span className={cn("tabular-nums", net > 0 ? "text-primary" : "text-destructive")}>
                      {formatMoney(net, entry?.currency ?? group.default_currency, { signed: true })}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </ListPanel>
  );
}

type ActivityItem = { id: string; date: string; created: string; title: string; detail: string; amount: string; tone?: "in" | "out" };

export function RecentActivity() {
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const expenses = useExpenses(ACTIVITY_PARAMS);
  const settlements = useSettlements(ACTIVITY_PARAMS);

  const items = useMemo(() => {
    if (!me || !expenses.data || !settlements.data) return null;
    const names = buildNameMap(groups);
    const groupName = new Map((groups ?? []).map((g) => [g.id, g.name]));
    const where = (groupId?: string | null) => (groupId ? groupName.get(groupId) ?? "Group" : "Personal");
    const list: ActivityItem[] = [];

    for (const e of expenses.data) {
      if (e.deleted_at) continue;
      const share = e.splits.find((s) => s.user_id === me.id);
      const payer = displayName(names, e.paid_by_id, me.id);
      list.push({
        id: `e-${e.id}`,
        date: e.date,
        created: e.created_at,
        title: e.description,
        detail: `${payer} paid · ${where(e.group_id)} · ${formatDay(e.date)}`,
        amount: share && e.paid_by_id !== me.id
          ? `your share ${formatMoney(num(share.amount_owed), e.currency)}`
          : formatMoney(num(e.amount), e.currency),
      });
    }
    for (const s of settlements.data) {
      const incoming = s.received_by_id === me.id;
      const outgoing = s.paid_by_id === me.id;
      const from = displayName(names, s.paid_by_id, me.id);
      const to = displayName(names, s.received_by_id, me.id, { you: "you" });
      list.push({
        id: `s-${s.id}`,
        date: s.date,
        created: s.created_at,
        title: `${from} paid ${to}`,
        detail: `Settlement · ${where(s.group_id)} · ${formatDay(s.date)}`,
        amount: formatMoney(num(s.amount), s.currency),
        tone: incoming ? "in" : outgoing ? "out" : undefined,
      });
    }
    return list
      .sort((a, b) => (a.date === b.date ? (a.created < b.created ? 1 : -1) : a.date < b.date ? 1 : -1))
      .slice(0, ACTIVITY_ROWS);
  }, [me, groups, expenses.data, settlements.data]);

  const loading = expenses.isLoading || settlements.isLoading;
  const failed = expenses.isError || settlements.isError;

  return (
    <ListPanel title="Recent activity" href="/dashboard/expenses" linkLabel="All expenses">
      {loading ? (
        <RowsSkeleton rows={5} />
      ) : failed || !items ? (
        <Retry
          what="recent activity"
          onRetry={() => {
            if (expenses.isError) expenses.refetch();
            if (settlements.isError) settlements.refetch();
          }}
        />
      ) : items.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">No expenses or payments yet.</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.id} className={rowClass}>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{item.title}</span>
                <span className="truncate text-xs text-muted-foreground">{item.detail}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 text-right tabular-nums",
                  item.tone === "in" && "text-primary",
                  item.tone === "out" && "text-muted-foreground",
                )}
              >
                {item.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ListPanel>
  );
}
