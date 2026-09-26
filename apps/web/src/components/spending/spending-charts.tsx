"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@settle/ui/components/chart";

import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { formatMoney } from "@/lib/balances";
import { monthBounds, monthLabel } from "@/lib/months";
import { num } from "@/lib/people";
import type { SpendingSummary } from "@/types";

const dailyConfig: ChartConfig = { amount: { label: "Spent", color: "var(--chart-1)" } };
const trendConfig: ChartConfig = { amount: { label: "Spent", color: "var(--chart-2)" } };

// recharts is heavy, so this file is only reached through next/dynamic.
export function DailySpendChart({ summary }: { summary: SpendingSummary }) {
  const data = useMemo(() => {
    const byDay = new Map(summary.daily.map((d) => [d.date.slice(0, 10), num(d.amount)]));
    const { to } = monthBounds(summary.month);
    const days = Number(to.slice(8, 10));
    // Every day of the month, so quiet days read as gaps rather than vanishing.
    return Array.from({ length: days }, (_, i) => {
      const date = `${summary.month}-${String(i + 1).padStart(2, "0")}`;
      return { date, label: String(i + 1), amount: byDay.get(date) ?? 0 };
    });
  }, [summary]);

  const busiest = data.reduce((best, d) => (d.amount > best.amount ? d : best), data[0]);

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Daily spend"
        description={
          busiest && busiest.amount > 0 ? (
            <>
              Biggest day was the {busiest.label}
              {ordinal(Number(busiest.label))} at{" "}
              <span className="font-medium text-foreground">
                {formatMoney(busiest.amount, summary.currency)}
              </span>
            </>
          ) : (
            "Nothing spent this month yet."
          )
        }
      />
      <ChartContainer config={dailyConfig} className="aspect-auto h-56 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = payload?.[0]?.payload?.date as string | undefined;
                  return date
                    ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })
                    : "";
                }}
              />
            }
          />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

export function TrendChart({ summary }: { summary: SpendingSummary }) {
  const data = summary.trend.map((t) => ({
    month: t.month,
    label: monthLabel(t.month, { short: true }),
    amount: num(t.amount),
  }));
  const months = data.filter((d) => d.amount > 0);
  const average = months.length ? months.reduce((s, d) => s + d.amount, 0) / months.length : 0;

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Last 6 months"
        description={
          average > 0 ? (
            <>
              Averaging{" "}
              <span className="font-medium text-foreground">{formatMoney(average, summary.currency)}</span> a month
            </>
          ) : (
            "No history yet."
          )
        }
      />
      <ChartContainer config={trendConfig} className="aspect-auto h-56 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}
