"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@settle/ui/components/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@settle/ui/components/select";
import { Skeleton } from "@settle/ui/components/skeleton";

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
        label: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
        expenses: expenseBuckets.get(date) ?? 0,
        settled: settledBuckets.get(date) ?? 0,
      }));

    const total = data.reduce((sum, d) => sum + d.expenses, 0);
    return { chartData: data, total };
  }, [expenses, settlements, days]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-2xl font-semibold">
            {total.toLocaleString(undefined, { style: "currency", currency })}
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Spend overview</p>
        <CardAction>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="aspect-video w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
            No spend data for this period yet.
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={2} />
              <Bar dataKey="settled" fill="var(--color-settled)" radius={2} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
