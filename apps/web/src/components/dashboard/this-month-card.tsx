"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Skeleton } from "@settle/ui/components/skeleton";

import { Eyebrow } from "@/components/dashboard/panel";
import { BudgetBar } from "@/components/spending/budget-bar";
import { useSpendingSummary } from "@/hooks/useSpendingSummary";
import { formatMoney } from "@/lib/balances";
import { monthLabel, monthProgress } from "@/lib/months";
import { num } from "@/lib/people";

// The personal-tracker strip on the overview: what the user spent this month
// against their overall budget, linking through to the Spending section.
export function ThisMonthCard() {
  const { data: summary, isLoading } = useSpendingSummary();

  if (isLoading || !summary) return <Skeleton className="h-[104px] rounded-2xl" />;

  const c = summary.currency;
  const total = num(summary.total);
  const budget = summary.overall_budget ? num(summary.overall_budget) : null;
  const previous = num(summary.previous_total);
  const change = previous > 0 ? ((total - previous) / previous) * 100 : null;

  return (
    <Link
      href="/dashboard/spending"
      className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-8"
    >
      <div className="flex flex-col gap-1">
        <Eyebrow>You spent in {monthLabel(summary.month, { short: true })}</Eyebrow>
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(total, c)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 text-[13px] text-muted-foreground">
        {budget ? (
          <>
            <BudgetBar spent={total} budget={budget} pace={monthProgress(summary.month)} />
            <span>
              {total > budget
                ? `${formatMoney(total - budget, c)} over your ${formatMoney(budget, c)} budget`
                : `${formatMoney(budget - total, c)} left of ${formatMoney(budget, c)}`}
              {change !== null && ` · ${change > 0 ? "+" : ""}${change.toFixed(0)}% vs last month`}
            </span>
          </>
        ) : (
          <span>
            {formatMoney(num(summary.personal_total), c)} personal, {formatMoney(num(summary.group_share_total), c)} your
            share of groups. Set a budget to track progress.
          </span>
        )}
      </div>
      <span className="flex items-center gap-1 text-sm font-medium">
        Spending
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
