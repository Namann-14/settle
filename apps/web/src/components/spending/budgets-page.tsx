"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Eyebrow, Panel, PanelHeader } from "@/components/dashboard/panel";
import { FormError } from "@/components/forms/field";
import { BudgetBar } from "@/components/spending/budget-bar";
import { CategoryIcon, categoryColor } from "@/components/spending/category-icon";
import { useDeleteBudget, useUpsertBudget } from "@/hooks/mutations";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSpendingSummary } from "@/hooks/useSpendingSummary";
import { formatMoney } from "@/lib/balances";
import { currentMonth, monthLabel, monthProgress } from "@/lib/months";
import { num } from "@/lib/people";
import type { Budget } from "@/types";

export function BudgetsPage() {
  const month = currentMonth();
  const { data: me } = useCurrentUser();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: summary } = useSpendingSummary(month);
  const currency = me?.default_currency ?? "INR";
  const pace = monthProgress(month);

  const budgetFor = useMemo(() => new Map(budgets?.map((b) => [b.category_id ?? "overall", b])), [budgets]);
  const spentFor = useMemo(
    () => new Map(summary?.by_category.map((c) => [c.category_id ?? "none", num(c.amount)])),
    [summary],
  );
  const categoryTotal = (budgets ?? []).reduce((s, b) => s + (b.category_id ? num(b.amount) : 0), 0);
  const overall = budgetFor.get("overall");

  return (
    <>
      <div className="flex flex-col gap-2">
        <Eyebrow>{monthLabel(month)} · resets every month</Eyebrow>
        <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
          Monthly <em className="italic">budgets</em>
        </h1>
      </div>

      {budgetsLoading || categoriesLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <>
          <Panel>
            <PanelHeader
              title="Overall"
              description={
                categoryTotal > 0
                  ? `Your category budgets add up to ${formatMoney(categoryTotal, currency)}`
                  : "A ceiling for everything you spend in a month"
              }
            />
            <BudgetRow
              categoryId={null}
              budget={overall}
              spent={num(summary?.total)}
              currency={currency}
              pace={pace}
              label="All spending"
            />
          </Panel>

          <Panel className="gap-2">
            <PanelHeader title="By category" description="Leave blank for no limit. The tick shows where you'd be on pace today." />
            <ul className="flex flex-col divide-y divide-border/50">
              {categories?.map((cat, i) => (
                <li key={cat.id} className="py-3">
                  <BudgetRow
                    categoryId={cat.id}
                    budget={budgetFor.get(cat.id)}
                    spent={spentFor.get(cat.id) ?? 0}
                    currency={currency}
                    pace={pace}
                    label={cat.name}
                    icon={<CategoryIcon icon={cat.icon} color={cat.color} index={i} />}
                    color={categoryColor(cat.color, i)}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </>
  );
}

function BudgetRow({
  categoryId,
  budget,
  spent,
  currency,
  pace,
  label,
  icon,
  color,
}: {
  categoryId: string | null;
  budget: Budget | undefined;
  spent: number;
  currency: string;
  pace: number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  const upsert = useUpsertBudget();
  const remove = useDeleteBudget();
  const saved = budget ? String(num(budget.amount)) : "";
  const [value, setValue] = useState(saved);
  const [error, setError] = useState<unknown>(null);
  // Re-sync the input when the saved budget changes underneath us.
  const [lastSaved, setLastSaved] = useState(saved);
  if (saved !== lastSaved) {
    setLastSaved(saved);
    setValue(saved);
  }

  const dirty = value !== saved;
  const limit = budget ? num(budget.amount) : 0;

  const save = async () => {
    setError(null);
    const amount = Number(value);
    try {
      if (!value.trim()) {
        if (budget) await remove.mutateAsync(budget.id);
      } else if (!(amount > 0)) {
        return setError(new Error("Budget must be above zero"));
      } else {
        await upsert.mutateAsync({ category_id: categoryId, amount: amount.toFixed(2) });
      }
      toast.success(value.trim() ? `${label} budget saved` : `${label} budget removed`);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate font-medium">{label}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {formatMoney(spent, currency)} spent
              {limit > 0 && (
                <span className={cn(spent > limit && "text-destructive")}>
                  {" "}
                  · {spent > limit ? `${formatMoney(spent - limit, currency)} over` : `${formatMoney(limit - spent, currency)} left`}
                </span>
              )}
            </span>
          </div>
          {limit > 0 ? (
            <BudgetBar spent={spent} budget={limit} pace={pace} color={color} />
          ) : (
            <div className="h-2 rounded-full bg-muted/60" />
          )}
        </div>
        <label className="flex h-10 w-36 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm focus-within:border-ring">
          <span className="text-xs text-muted-foreground">{currency}</span>
          <span className="sr-only">{label} monthly budget</span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="No limit"
            className="w-full min-w-0 bg-transparent text-right tabular-nums outline-none placeholder:text-muted-foreground"
          />
        </label>
        {dirty ? (
          <button
            type="submit"
            disabled={upsert.isPending || remove.isPending}
            className="h-10 w-16 shrink-0 rounded-xl bg-primary text-[13px] font-medium text-primary-foreground disabled:opacity-50"
          >
            Save
          </button>
        ) : budget ? (
          <button
            type="button"
            aria-label={`Remove ${label} budget`}
            onClick={async () => {
              try {
                await remove.mutateAsync(budget.id);
                toast.success(`${label} budget removed`);
              } catch (err) {
                setError(err);
              }
            }}
            className="flex h-10 w-16 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : (
          <span className="w-16 shrink-0" />
        )}
      </div>
      <FormError error={error} />
    </form>
  );
}
