"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";
import { ChartContainer, type ChartConfig } from "@settle/ui/components/chart";
import { Skeleton } from "@settle/ui/components/skeleton";

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

  const { breakdown, total, chartConfig, row } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const expense of expenses ?? []) {
      const key = expense.category_id ?? "uncategorized";
      totals.set(key, (totals.get(key) ?? 0) + Number(expense.amount));
    }

    const nameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
    nameById.set("uncategorized", "Uncategorized");

    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [, v]) => sum + v, 0);

    const config: ChartConfig = {};
    const rowData: Record<string, number> = {};
    const breakdown = sorted.map(([categoryId, amount], i) => {
      const color = CHART_COLORS[i % CHART_COLORS.length];
      const name = nameById.get(categoryId) ?? "Uncategorized";
      config[categoryId] = { label: name, color };
      rowData[categoryId] = amount;
      return { categoryId, name, amount, color, pct: total > 0 ? (amount / total) * 100 : 0 };
    });

    return { breakdown, total, chartConfig: config, row: [rowData] };
  }, [expenses, categories]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost analysis</CardTitle>
        <p className="text-xs text-muted-foreground">Spending overview</p>
        <p className="text-2xl font-semibold">
          {total.toLocaleString(undefined, { style: "currency", currency })}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-4 w-full" />
        ) : breakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses yet.</p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-6">
              <BarChart data={row} layout="vertical" barSize={24}>
                <XAxis type="number" hide />
                <YAxis type="category" hide />
                {breakdown.map((b) => (
                  <Bar
                    key={b.categoryId}
                    dataKey={b.categoryId}
                    stackId="a"
                    fill={b.color}
                    radius={2}
                  />
                ))}
              </BarChart>
            </ChartContainer>
            <ul className="flex flex-col gap-1.5">
              {breakdown.map((b) => (
                <li key={b.categoryId} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    {b.name}
                  </span>
                  <span className="text-muted-foreground">{b.pct.toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
