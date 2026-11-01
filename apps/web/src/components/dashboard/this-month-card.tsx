"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Skeleton } from "@settle/ui/components/skeleton";

import { BudgetBar } from "@/components/spending/budget-bar";
import { useSpendingSummary } from "@/hooks/useSpendingSummary";
import { formatMoney } from "@/lib/balances";
import { monthLabel, monthProgress } from "@/lib/months";
import { num } from "@/lib/people";

// The personal-tracker strip on the overview: what the user spent this month
// against their overall budget, linking through to the Spending section.
export function ThisMonthCard() {
  const { data: summary, isLoading } = useSpendingSummary();

  if (isLoading) return <Skeleton className="h-[68px] rounded-2xl" />;
  // A failed summary just leaves the strip out; Spending has the full view.
  if (!summary) return null;

  const c = summary.currency;
  const total = num(summary.total);
  const budget = summary.overall_budget ? num(summary.overall_budget) : null;
  const previous = num(summary.previous_total);

  return (
    <Link
      href="/dashboard/spending"
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:gap-8 md:px-6"
    >
      <div className="flex items-baseline gap-3 sm:flex-col sm:gap-0.5">
        <span className="text-sm font-semibold">{monthLabel(summary.month)} spending</span>
        <span className="text-lg font-semibold tracking-tight tabular-nums">{formatMoney(total, c)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 text-meta text-muted-foreground">
        {budget ? (
          <>
            <BudgetBar spent={total} budget={budget} pace={monthProgress(summary.month)} />
            <span>
              {total > budget
                ? `${formatMoney(total - budget, c)} over your ${formatMoney(budget, c)} budget`
                : `${formatMoney(budget - total, c)} left of ${formatMoney(budget, c)}`}
              {previous > 0 && ` · ${formatMoney(previous, c)} last month`}
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
