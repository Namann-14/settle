"use client";

import { useMemo, useState } from "react";
import { Pause, Play, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@settle/ui/lib/utils";

import {
  FigureStrip,
  PageHeader,
  Panel,
  PanelHeader,
  buttonClass,
  type Figure,
} from "@/components/dashboard/panel";
import { CategoryIcon } from "@/components/spending/category-icon";
import { RecurringDialog, type RecurringSeed } from "@/components/spending/recurring-dialog";
import { EmptyLine, LoadError, PanelSkeleton } from "@/components/spending/states";
import { useUpdateRecurring } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRecurring } from "@/hooks/useRecurring";
import { formatMoney } from "@/lib/balances";
import { describeFrequency } from "@/lib/frequency";
import { formatDay, num } from "@/lib/people";
import type { Frequency } from "@/types";

// Rough monthly cost of a rule, for the "per month" figure.
const PER_MONTH: Record<Frequency, number> = { DAILY: 30.44, WEEKLY: 4.345, MONTHLY: 1, YEARLY: 1 / 12 };

export function RecurringPage() {
  const { data: me } = useCurrentUser();
  const { data: rules, isLoading, isError, refetch } = useRecurring();
  const { data: categories } = useCategories();
  const updateRule = useUpdateRecurring();
  const [seed, setSeed] = useState<RecurringSeed | null>(null);
  const category = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories]);
  const currency = me?.default_currency ?? "INR";

  const active = (rules ?? []).filter((r) => r.is_active);
  const monthly = active
    .filter((r) => r.currency === currency)
    .reduce((sum, r) => sum + (num(r.amount) * PER_MONTH[r.frequency]) / r.interval, 0);

  const figures: Figure[] = [
    { label: "About per month", value: formatMoney(monthly, currency), money: true, hint: `Active ones in ${currency}` },
    { label: "Active", value: active.length },
    { label: "Paused or ended", value: (rules?.length ?? 0) - active.length, tone: "muted" },
  ];

  const toggle = async (id: string, nextActive: boolean) => {
    try {
      await updateRule.mutateAsync({ id, data: { is_active: nextActive } });
      toast.success(nextActive ? "Resumed" : "Paused");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update");
    }
  };

  return (
    <>
      <PageHeader
        title="Recurring"
        description="Rent, subscriptions and bills. Each one logs itself when it falls due."
        actions={
          <button type="button" onClick={() => setSeed({ mode: "create" })} className={buttonClass()}>
            <Plus />
            New recurring
          </button>
        }
      />

      {isLoading ? (
        <PanelSkeleton rows={4} />
      ) : isError || !rules ? (
        <Panel>
          <LoadError what="your recurring expenses" onRetry={() => refetch()} />
        </Panel>
      ) : (
        <div className="flex animate-fade-in flex-col gap-4">
          {rules.length > 0 && <FigureStrip figures={figures} />}

          <Panel className="gap-2">
            <PanelHeader
              title="All recurring"
              description={rules.length > 0 ? "Open one to edit it, or pause it until you need it again." : undefined}
            />
            {rules.length === 0 ? (
              <EmptyLine>Nothing recurring yet. Add rent or a subscription once and it logs itself.</EmptyLine>
            ) : (
              <ul className="-mx-2 flex flex-col">
                {rules.map((rule) => {
                  const cat = rule.category_id ? category.get(rule.category_id) : undefined;
                  return (
                    <li
                      key={rule.id}
                      className={cn(
                        "flex items-center gap-2 border-b border-border/50 last:border-b-0",
                        !rule.is_active && "text-muted-foreground",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSeed({ mode: "edit", rule })}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-3 text-left text-sm transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <CategoryIcon
                          icon={cat?.icon ?? "repeat"}
                          color={cat?.color}
                          className={cn(!rule.is_active && "opacity-60")}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">{rule.description}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {describeFrequency(rule.frequency, rule.interval)} · {cat?.name ?? "Uncategorized"} ·{" "}
                            {rule.is_active
                              ? `next ${formatDay(rule.next_run_date)}`
                              : rule.end_date && rule.next_run_date > rule.end_date
                                ? "ended"
                                : "paused"}
                          </span>
                        </span>
                        <span className="shrink-0 font-medium tabular-nums">
                          {formatMoney(num(rule.amount), rule.currency)}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={rule.is_active ? `Pause ${rule.description}` : `Resume ${rule.description}`}
                        onClick={() => toggle(rule.id, !rule.is_active)}
                        disabled={updateRule.isPending}
                        className={buttonClass({ variant: "ghost", size: "sm", className: "mr-2 w-11 px-0 sm:w-8" })}
                      >
                        {rule.is_active ? <Pause /> : <Play />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <RecurringDialog seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
    </>
  );
}
