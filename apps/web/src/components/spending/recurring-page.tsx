"use client";

import { useMemo, useState } from "react";
import { Pause, Play, Plus, Repeat } from "lucide-react";
import { toast } from "sonner";

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Eyebrow } from "@/components/dashboard/panel";
import { CategoryIcon } from "@/components/spending/category-icon";
import { RecurringDialog, type RecurringSeed } from "@/components/spending/recurring-dialog";
import { useUpdateRecurring } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRecurring } from "@/hooks/useRecurring";
import { formatMoney } from "@/lib/balances";
import { describeFrequency } from "@/lib/frequency";
import { formatDay, num } from "@/lib/people";
import type { Frequency } from "@/types";

// Rough monthly cost of a rule, for the "per month" headline.
const PER_MONTH: Record<Frequency, number> = { DAILY: 30.44, WEEKLY: 4.345, MONTHLY: 1, YEARLY: 1 / 12 };

export function RecurringPage() {
  const { data: me } = useCurrentUser();
  const { data: rules, isLoading } = useRecurring();
  const { data: categories } = useCategories();
  const updateRule = useUpdateRecurring();
  const [seed, setSeed] = useState<RecurringSeed | null>(null);
  const category = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories]);
  const currency = me?.default_currency ?? "INR";

  const monthly = (rules ?? [])
    .filter((r) => r.is_active && r.currency === currency)
    .reduce((sum, r) => sum + (num(r.amount) * PER_MONTH[r.frequency]) / r.interval, 0);

  const toggle = async (id: string, active: boolean) => {
    try {
      await updateRule.mutateAsync({ id, data: { is_active: active } });
      toast.success(active ? "Resumed" : "Paused");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Eyebrow>About {formatMoney(monthly, currency)} a month in fixed costs</Eyebrow>
          <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
            Recurring <em className="italic">expenses</em>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setSeed({ mode: "create" })}
          className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:self-auto"
        >
          <Plus className="size-4" />
          New recurring
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : !rules || rules.length === 0 ? (
          <Empty className="py-14">
            <EmptyMedia variant="icon">
              <Repeat />
            </EmptyMedia>
            <EmptyTitle>No recurring expenses</EmptyTitle>
            <EmptyDescription>Add rent, subscriptions or bills once and they log themselves.</EmptyDescription>
          </Empty>
        ) : (
          <ul>
            {rules.map((rule) => {
              const cat = rule.category_id ? category.get(rule.category_id) : undefined;
              return (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-3 border-t border-border/50 px-5 py-3.5 first:border-t-0",
                    !rule.is_active && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSeed({ mode: "edit", rule })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <CategoryIcon icon={cat?.icon ?? "repeat"} color={cat?.color} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{rule.description}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {describeFrequency(rule.frequency, rule.interval)} · {cat?.name ?? "Uncategorized"} ·{" "}
                        {rule.is_active
                          ? `next ${formatDay(rule.next_run_date)}`
                          : rule.end_date && rule.next_run_date > rule.end_date
                            ? "ended"
                            : "paused"}
                      </span>
                    </span>
                  </button>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatMoney(num(rule.amount), rule.currency)}
                  </span>
                  <button
                    type="button"
                    aria-label={rule.is_active ? `Pause ${rule.description}` : `Resume ${rule.description}`}
                    onClick={() => toggle(rule.id, !rule.is_active)}
                    disabled={updateRule.isPending}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {rule.is_active ? <Pause className="size-4" /> : <Play className="size-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <RecurringDialog seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
    </>
  );
}
