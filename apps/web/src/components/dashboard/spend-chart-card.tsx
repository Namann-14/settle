"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@settle/ui/components/chart";
import { cn } from "@settle/ui/lib/utils";

import { ChartPanelSkeleton } from "@/components/dashboard/overview-skeleton";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettlements } from "@/hooks/useSettlements";

const PERIODS = { "7d": 7, "30d": 30, "90d": 90 } as const;
type Period = keyof typeof PERIODS;

const chartConfig: ChartConfig = {
  expenses: { label: "Expenses", color: "var(--chart-1)" },
  settled: { label: "Settled", color: "var(--chart-2)" },
};

function bucketByDay(
  rows: { date: string; amount: number | string }[],
  days: number,
): Map<string, number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const d = new Date(row.date);
    if (d < cutoff) continue;
    const key = row.date.slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
  }
  return buckets;
}

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div role="group" aria-label="Period" className="flex gap-1 rounded-full bg-muted p-1 text-xs">
      {(Object.keys(PERIODS) as Period[]).map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={value === p}
          onClick={() => onChange(p)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1.5 transition-colors",
            value === p
              ? "bg-card font-medium text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function SpendChartCard() {
  const [period, setPeriod] = useState<Period>("30d");
  const { data: expenses, isLoading: expensesLoading } = useExpenses({ limit: 100 });
  const { data: settlements, isLoading: settlementsLoading } = useSettlements({ limit: 100 });
  const { data: me } = useCurrentUser();
  const currency = me?.default_currency ?? "USD";

  const isLoading = expensesLoading || settlementsLoading;
  const days = PERIODS[period];

  const { chartData, total } = useMemo(() => {
    const expenseBuckets = bucketByDay(expenses ?? [], days);
    const settledBuckets = bucketByDay(settlements ?? [], days);
    const allDates = new Set([...expenseBuckets.keys(), ...settledBuckets.keys()]);

    const data = [...allDates]
      .sort()
      .map((date) => ({
        date,
        label: new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        expenses: expenseBuckets.get(date) ?? 0,
        settled: settledBuckets.get(date) ?? 0,
      }));

    const total = data.reduce((sum, d) => sum + d.expenses, 0);
    return { chartData: data, total };
  }, [expenses, settlements, days]);

  if (isLoading) return <ChartPanelSkeleton />;

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Spend overview"
        description={
          <>
            <span className="font-medium text-foreground">
              {total.toLocaleString(undefined, { style: "currency", currency })}
            </span>{" "}
            in group expenses, last {days} days
          </>
        }
        action={<PeriodToggle value={period} onChange={setPeriod} />}
      />
      {chartData.length === 0 ? (
        <div className="flex h-60 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          No spend data for this period yet.
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="settled" fill="var(--color-settled)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
      <div className="flex gap-5 text-xs text-muted-foreground">
        {Object.entries(chartConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-xs" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </span>
        ))}
      </div>
    </Panel>
  );
}
