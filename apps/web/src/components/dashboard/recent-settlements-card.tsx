"use client";

import { useMemo } from "react";
import { HandCoins } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@settle/ui/components/empty";

import { ListRowsSkeleton } from "@/components/dashboard/overview-skeleton";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroups } from "@/hooks/useGroups";
import { useSettlements } from "@/hooks/useSettlements";

export function RecentSettlementsCard() {
  const { data: settlements, isLoading, isError } = useSettlements({ limit: 8 });
  const { data: groups } = useGroups();
  const { data: me } = useCurrentUser();

  // Settlements only carry paid_by_id/received_by_id UUIDs — there's no
  // GET /users/{id}, so a counterparty name can only be resolved by
  // cross-referencing the already-fetched group member list. Falls back to
  // a generic label when it can't be resolved (e.g. no group_id, or the
  // member's name wasn't set).
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of groups ?? []) {
      for (const member of group.members) {
        if (member.user_name) map.set(member.user_id, member.user_name);
      }
    }
    return map;
  }, [groups]);

  const describe = (userId: string) => {
    if (me && userId === me.id) return "You";
    return nameById.get(userId) ?? "Member";
  };

  const recent = useMemo(
    () => [...(settlements ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [settlements],
  );

  return (
    <Panel className="h-full">
      <PanelHeader title="Recent settlements" />
      {isLoading ? (
        <ListRowsSkeleton />
      ) : isError ? (
        <Empty>
          <EmptyMedia variant="icon">
            <HandCoins />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load settlements</EmptyTitle>
          <EmptyDescription>Try refreshing the page.</EmptyDescription>
        </Empty>
      ) : recent.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <HandCoins />
          </EmptyMedia>
          <EmptyTitle>No settlements yet</EmptyTitle>
          <EmptyDescription>Payments made to settle a debt will show up here.</EmptyDescription>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {recent.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3.5 py-2.5 text-sm"
            >
              <span className="truncate">
                {describe(s.paid_by_id)} → {describe(s.received_by_id)}
              </span>
              <span className="font-semibold">
                {Number(s.amount).toLocaleString(undefined, {
                  style: "currency",
                  currency: s.currency,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
