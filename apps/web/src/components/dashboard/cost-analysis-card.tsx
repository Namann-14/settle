"use client";

import { useMemo } from "react";

import { CategoryPanelSkeleton } from "@/components/dashboard/overview-skeleton";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function CostAnalysisCard() {
  const { data: expenses, isLoading: expensesLoading } = useExpenses({ limit: 100 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: me } = useCurrentUser();
  const currency = me?.default_currency ?? "USD";

  const isLoading = expensesLoading || categoriesLoading;

  const { breakdown, total } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const expense of expenses ?? []) {
      const key = expense.category_id ?? "uncategorized";
      totals.set(key, (totals.get(key) ?? 0) + Number(expense.amount));
    }

    const nameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
    nameById.set("uncategorized", "Uncategorized");

    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [, v]) => sum + v, 0);

    const breakdown = sorted.map(([categoryId, amount], i) => ({
      categoryId,
      name: nameById.get(categoryId) ?? "Uncategorized",
      amount,
      color: CHART_COLORS[i % CHART_COLORS.length],
      pct: total > 0 ? (amount / total) * 100 : 0,
    }));

    return { breakdown, total };
  }, [expenses, categories]);

  if (isLoading) return <CategoryPanelSkeleton />;

  return (
    <Panel className="h-full">
      <PanelHeader
        title="By category"
        description={
          <>
            <span className="font-medium text-foreground">
              {total.toLocaleString(undefined, { style: "currency", currency })}
            </span>{" "}
            across recent expenses
          </>
        }
      />
      {breakdown.length === 0 ? (
        <p className="text-sm text-muted-foreground">No expenses yet.</p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {breakdown.map((b) => (
              <span key={b.categoryId} style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
            ))}
          </div>
          <ul className="flex flex-col gap-3 text-sm">
            {breakdown.map((b) => (
              <li key={b.categoryId} className="flex items-center justify-between gap-3">
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
