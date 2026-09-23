"use client";

import { useMemo } from "react";

import { cn } from "@settle/ui/lib/utils";

import { StatSkeleton } from "@/components/dashboard/overview-skeleton";
import { Eyebrow } from "@/components/dashboard/panel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettlements } from "@/hooks/useSettlements";
import { computeBalances, formatMoney, myShareSince } from "@/lib/balances";

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

function Stat({
  label,
  value,
  caption,
  highlight,
}: {
  label: string;
  value: string;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-2xl p-5",
        highlight
          ? "bg-primary text-primary-foreground shadow-[0_25px_80px_-12px_rgba(46,89,70,0.35)]"
          : "border border-border/70 bg-card",
      )}
    >
      <Eyebrow className={highlight ? "text-primary-foreground/70" : undefined}>{label}</Eyebrow>
      <span className="font-display text-4xl leading-none tracking-tight lg:text-[44px]">
        {value}
      </span>
      <span
        className={cn("text-[13px]", highlight ? "text-primary-foreground/80" : "text-muted-foreground")}
      >
        {caption}
      </span>
    </div>
  );
}

export function BalanceSummary() {
  const { data: me, isLoading: meLoading } = useCurrentUser();
  const { data: expenses, isLoading: expensesLoading } = useExpenses({ limit: 100 });
  const { data: settlements, isLoading: settlementsLoading } = useSettlements({ limit: 100 });
  const loading = meLoading || expensesLoading || settlementsLoading;
  const currency = me?.default_currency ?? "USD";

  const stats = useMemo(() => {
    if (!me) return null;
    return {
      ...computeBalances(expenses ?? [], settlements ?? [], me.id),
      spent: myShareSince(expenses ?? [], me.id, 30),
    };
  }, [expenses, settlements, me]);

  const net = stats?.net ?? 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatSkeleton highlight />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        highlight
        label="Net balance"
        value={formatMoney(net, currency, { signed: true })}
        caption={net > 0 ? "You’re ahead overall" : net < 0 ? "You’re behind overall" : "You’re all settled up"}
      />
      <Stat
        label="You’re owed"
        value={formatMoney(stats?.owed ?? 0, currency)}
        caption={`From ${people(stats?.owedByCount ?? 0)}`}
      />
      <Stat
        label="You owe"
        value={formatMoney(stats?.owe ?? 0, currency)}
        caption={`To ${people(stats?.owesToCount ?? 0)}`}
      />
      <Stat
        label="Spent · 30 days"
        value={formatMoney(stats?.spent ?? 0, currency)}
        caption="Your share of expenses"
      />
    </div>
  );
}
