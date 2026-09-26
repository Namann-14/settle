"use client";

import Link from "next/link";

import { CategoryPanelSkeleton } from "@/components/dashboard/overview-skeleton";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { categoryColor } from "@/components/spending/category-icon";
import { useSpendingSummary } from "@/hooks/useSpendingSummary";
import { formatMoney } from "@/lib/balances";
import { num } from "@/lib/people";

// This month's spending by category: the user's own share (personal expenses
// plus their split of group ones), not the full bill amounts.
export function CostAnalysisCard() {
  const { data: summary, isLoading } = useSpendingSummary();

  if (isLoading) return <CategoryPanelSkeleton />;

  const total = num(summary?.total);
  const breakdown = (summary?.by_category ?? [])
    .filter((c) => num(c.amount) > 0)
    .map((c, i) => ({
      key: c.category_id ?? "uncategorized",
      name: c.name,
      color: categoryColor(c.color, i),
      pct: total > 0 ? (num(c.amount) / total) * 100 : 0,
    }));

  return (
    <Panel className="h-full">
      <PanelHeader
        title="By category"
        description={
          <>
            <span className="font-medium text-foreground">{formatMoney(total, summary?.currency ?? "INR")}</span> your
            share this month
          </>
        }
        action={
          <Link href="/dashboard/spending" className="text-xs text-muted-foreground hover:text-foreground">
            Details
          </Link>
        }
      />
      {breakdown.length === 0 ? (
        <p className="text-sm text-muted-foreground">No expenses this month yet.</p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {breakdown.map((b) => (
              <span key={b.key} style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
            ))}
          </div>
          <ul className="flex flex-col gap-3 text-sm">
            {breakdown.map((b) => (
              <li key={b.key} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="truncate">{b.name}</span>
                </span>
                <span className="text-muted-foreground">{b.pct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
