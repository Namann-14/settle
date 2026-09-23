"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@settle/ui/components/empty";
import { cn } from "@settle/ui/lib/utils";

import { ListRowsSkeleton } from "@/components/dashboard/overview-skeleton";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { useSettlements } from "@/hooks/useSettlements";
import { computeBalances, formatMoney } from "@/lib/balances";

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export function GroupsCard() {
  const { data: groups, isLoading, isError } = useGroups();
  const { data: me } = useCurrentUser();
  const { data: expenses } = useExpenses({ limit: 100 });
  const { data: settlements } = useSettlements({ limit: 100 });

  const byGroup = useMemo(
    () => (me ? computeBalances(expenses ?? [], settlements ?? [], me.id).byGroup : null),
    [expenses, settlements, me],
  );

  return (
    <Panel className="h-full">
      <PanelHeader title="Your groups" />
      {isLoading ? (
        <ListRowsSkeleton avatar />
      ) : isError ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load groups</EmptyTitle>
          <EmptyDescription>Try refreshing the page.</EmptyDescription>
        </Empty>
      ) : !groups || groups.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No groups yet</EmptyTitle>
          <EmptyDescription>Create one to start splitting expenses.</EmptyDescription>
        </Empty>
      ) : (
        <ul className="flex flex-col">
          {groups.map((group) => {
            const members = group.members.filter((m) => !m.removed_at).length;
            const balance = byGroup?.get(group.id) ?? 0;
            return (
              <li
                key={group.id}
                className="flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-[13px] font-semibold text-primary">
                  {initials(group.name)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {members} {members === 1 ? "member" : "members"}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    balance > 0.005
                      ? "text-primary"
                      : balance < -0.005
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {Math.abs(balance) < 0.005
                    ? "Settled"
                    : formatMoney(balance, group.default_currency, { signed: true })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
