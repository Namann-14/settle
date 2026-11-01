"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@settle/ui/lib/utils";

import {
  FigureStrip,
  FigureStripSkeleton,
  PageHeader,
  Panel,
  PanelHeader,
  buttonClass,
  type Figure,
} from "@/components/dashboard/panel";
import { FormError } from "@/components/forms/field";
import { BudgetBar } from "@/components/spending/budget-bar";
import { CategoryIcon, categoryColor } from "@/components/spending/category-icon";
import { EmptyLine, LoadError, PanelSkeleton } from "@/components/spending/states";
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
  const budgetsQuery = useBudgets();
  const categoriesQuery = useCategories();
  const { data: budgets } = budgetsQuery;
  const { data: categories } = categoriesQuery;
  const { data: summary } = useSpendingSummary(month);
  const currency = me?.default_currency ?? "INR";
  const pace = monthProgress(month);

  const budgetFor = useMemo(() => new Map(budgets?.map((b) => [b.category_id ?? "overall", b])), [budgets]);
  const spentFor = useMemo(
    () => new Map(summary?.by_category.map((c) => [c.category_id ?? "none", num(c.amount)])),
    [summary],
  );
  const categoryBudgets = (budgets ?? []).filter((b) => b.category_id);
  const categoryTotal = categoryBudgets.reduce((s, b) => s + num(b.amount), 0);
  const overall = budgetFor.get("overall");
  const spent = num(summary?.total);
  const overallLimit = overall ? num(overall.amount) : 0;

  const loading = budgetsQuery.isLoading || categoriesQuery.isLoading;
  const failed = budgetsQuery.isError || categoriesQuery.isError;

  const figures: Figure[] = [
    overall
      ? { label: "Overall budget", value: formatMoney(overallLimit, currency), money: true, hint: "For all spending" }
      : { label: "Overall budget", value: "Not set", tone: "muted", hint: "Set one below" },
    {
      label: "Spent so far",
      value: formatMoney(spent, currency),
      money: true,
      tone: overallLimit > 0 && spent > overallLimit ? "negative" : undefined,
      hint:
        overallLimit > 0
          ? spent > overallLimit
            ? `${formatMoney(spent - overallLimit, currency)} over`
            : `${formatMoney(overallLimit - spent, currency)} left`
          : monthLabel(month),
    },
    {
      label: "Category budgets",
      value: formatMoney(categoryTotal, currency),
      money: true,
      hint: `${categoryBudgets.length} of ${categories?.length ?? 0} categories`,
    },
  ];

  return (
    <>
      <PageHeader title="Budgets" description={`Monthly limits for ${monthLabel(month)}. They reset on the 1st.`} />

      {loading ? (
        <div aria-busy aria-label="Loading budgets" className="flex flex-col gap-4">
          <FigureStripSkeleton count={3} />
          <PanelSkeleton rows={1} />
          <PanelSkeleton rows={6} />
        </div>
      ) : failed ? (
        <Panel>
          <LoadError
            what="your budgets"
            onRetry={() => {
              if (budgetsQuery.isError) budgetsQuery.refetch();
              if (categoriesQuery.isError) categoriesQuery.refetch();
            }}
          />
        </Panel>
      ) : (
        <div className="flex animate-fade-in flex-col gap-4">
          <FigureStrip figures={figures} />

          <Panel className="gap-2">
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
              spent={spent}
              currency={currency}
              pace={pace}
              label="All spending"
            />
          </Panel>

          <Panel className="gap-2">
            <PanelHeader
              title="By category"
              description="Leave blank for no limit. The tick marks where you’d be on pace today."
            />
            {(categories ?? []).length === 0 ? (
              <EmptyLine>No categories yet. Add one under Categories to budget for it.</EmptyLine>
            ) : (
              <ul className="flex flex-col">
                {categories?.map((cat, i) => (
                  <li key={cat.id} className="border-b border-border/50 py-3 last:border-b-0">
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
            )}
          </Panel>
        </div>
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
      {/* Stacks on phones: name and bar first, then the amount field and its action. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{label}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatMoney(spent, currency)} spent
                {limit > 0 && (
                  <span className={cn(spent > limit && "text-destructive")}>
                    {" "}
                    ·{" "}
                    {spent > limit
                      ? `${formatMoney(spent - limit, currency)} over`
                      : `${formatMoney(limit - spent, currency)} left`}
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
        </div>
        <div className="flex items-center gap-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-input bg-card px-3 text-sm transition-colors duration-150 focus-within:border-ring sm:h-9 sm:w-36 sm:flex-none">
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
              className={buttonClass({ className: "w-16 px-0" })}
            >
              Save
            </button>
          ) : budget ? (
            <button
              type="button"
              aria-label={`Remove ${label} budget`}
              disabled={remove.isPending}
              onClick={async () => {
                try {
                  await remove.mutateAsync(budget.id);
                  toast.success(`${label} budget removed`);
                } catch (err) {
                  setError(err);
                }
              }}
              className={buttonClass({ variant: "ghost", className: "w-16 px-0" })}
            >
              <X />
            </button>
          ) : (
            <span aria-hidden className="w-16 shrink-0" />
          )}
        </div>
      </div>
      <FormError error={error} />
    </form>
  );
}
