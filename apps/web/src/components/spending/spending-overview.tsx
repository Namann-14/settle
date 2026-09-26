"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, Receipt, Wallet } from "lucide-react";

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { ChartPanelSkeleton } from "@/components/dashboard/overview-skeleton";
import { Eyebrow, Panel, PanelHeader } from "@/components/dashboard/panel";
import { AiQuickAdd } from "@/components/expenses/ai-quick-add";
import { ExpenseSheet, type ExpenseSheetSeed } from "@/components/expenses/expense-sheet";
import { BudgetBar, budgetState } from "@/components/spending/budget-bar";
import { CategoryIcon, categoryColor } from "@/components/spending/category-icon";
import { IncomeDialog, type IncomeSeed } from "@/components/spending/income-dialog";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { useIncomes } from "@/hooks/useIncomes";
import { useSpendingSummary } from "@/hooks/useSpendingSummary";
import { formatMoney } from "@/lib/balances";
import { currentMonth, monthBounds, monthLabel, monthProgress, shiftMonth } from "@/lib/months";
import { formatDay, num } from "@/lib/people";
import type { Expense, SpendingSummary } from "@/types";

const DailySpendChart = dynamic(
  () => import("@/components/spending/spending-charts").then((m) => m.DailySpendChart),
  { ssr: false, loading: () => <ChartPanelSkeleton /> },
);
const TrendChart = dynamic(
  () => import("@/components/spending/spending-charts").then((m) => m.TrendChart),
  { ssr: false, loading: () => <ChartPanelSkeleton /> },
);

const monthHref = (month: string) =>
  (month === currentMonth() ? "/dashboard/spending" : `/dashboard/spending?month=${month}`) as Route;

export function SpendingOverview({ month }: { month: string }) {
  const { data: summary, isLoading, isError } = useSpendingSummary(month);
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const [incomeSeed, setIncomeSeed] = useState<IncomeSeed | null>(null);
  const atLatest = month >= currentMonth();

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Link
              href={monthHref(shiftMonth(month, -1))}
              aria-label="Previous month"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <Eyebrow className="min-w-32 text-center">{monthLabel(month)}</Eyebrow>
            <Link
              href={monthHref(shiftMonth(month, 1))}
              aria-label="Next month"
              aria-disabled={atLatest}
              tabIndex={atLatest ? -1 : undefined}
              className={cn(
                "rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
                atLatest && "pointer-events-none opacity-30",
              )}
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
            Your <em className="italic">spending</em>
          </h1>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIncomeSeed({ mode: "create" })}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Wallet className="size-4" />
            Add income
          </button>
          <button
            type="button"
            onClick={() => setSeed({ mode: "create", groupId: null })}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Add expense
          </button>
        </div>
      </div>

      <AiQuickAdd onDraft={(draft) => setSeed({ mode: "draft", draft })} />

      {isLoading ? (
        <OverviewSkeleton />
      ) : isError || !summary ? (
        <Empty className="rounded-2xl border border-border/70 bg-card py-14">
          <EmptyTitle>Couldn&apos;t load your spending</EmptyTitle>
          <EmptyDescription>Try refreshing the page.</EmptyDescription>
        </Empty>
      ) : (
        <>
          <StatRow summary={summary} />
          <BudgetAlerts summary={summary} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DailySpendChart summary={summary} />
            </div>
            <CategoryBreakdown summary={summary} />
            <div className="lg:col-span-2">
              <MonthTransactions month={month} onOpen={(expense) => setSeed({ mode: "edit", expense })} />
            </div>
            <div className="flex flex-col gap-4">
              <TopMerchants summary={summary} />
              <IncomeList month={month} currency={summary.currency} onOpen={setIncomeSeed} />
            </div>
            <div className="lg:col-span-3">
              <TrendChart summary={summary} />
            </div>
          </div>
        </>
      )}

      <ExpenseSheet seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
      <IncomeDialog seed={incomeSeed} onOpenChange={(open) => !open && setIncomeSeed(null)} />
    </>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: React.ReactNode;
  tone?: "good" | "bad";
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-5">
      <Eyebrow>{label}</Eyebrow>
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums md:text-3xl",
          tone === "good" && "text-primary",
          tone === "bad" && "text-destructive",
        )}
      >
        {value}
      </span>
      {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
    </div>
  );
}

function StatRow({ summary }: { summary: SpendingSummary }) {
  const c = summary.currency;
  const total = num(summary.total);
  const previous = num(summary.previous_total);
  const change = previous > 0 ? ((total - previous) / previous) * 100 : null;
  const budget = summary.overall_budget ? num(summary.overall_budget) : null;
  const income = num(summary.income_total);
  const net = num(summary.net);
  const pace = monthProgress(summary.month);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Spent"
          value={formatMoney(total, c)}
          detail={
            change === null
              ? `${summary.expense_count} expenses`
              : `${change > 0 ? "+" : ""}${change.toFixed(0)}% vs ${monthLabel(shiftMonth(summary.month, -1), { short: true })}`
          }
        />
        {budget ? (
          <Stat
            label="Budget left"
            value={formatMoney(budget - total, c, { signed: budget - total < 0 })}
            tone={budget - total < 0 ? "bad" : undefined}
            detail={<BudgetBar spent={total} budget={budget} pace={pace} className="mt-1" />}
          />
        ) : (
          <Stat
            label="Budget"
            value="Not set"
            detail={
              <Link href="/dashboard/spending/budgets" className="underline underline-offset-2 hover:text-foreground">
                Set a monthly budget
              </Link>
            }
          />
        )}
        <Stat label="Income" value={formatMoney(income, c)} detail={income > 0 ? "recorded this month" : "none recorded"} />
        <Stat
          label={income > 0 && net < 0 ? "Overspent" : "Saved"}
          value={income > 0 ? formatMoney(net, c) : "—"}
          tone={income > 0 ? (net >= 0 ? "good" : "bad") : undefined}
          detail={income > 0 ? `${((net / income) * 100).toFixed(0)}% of income` : "add income to see savings"}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatMoney(num(summary.personal_total), c)} personal + {formatMoney(num(summary.group_share_total), c)} your
        share of group expenses
        {summary.other_currencies.length > 0 &&
          ` · not counted: ${summary.other_currencies.map((o) => formatMoney(num(o.amount), o.currency)).join(", ")}`}
      </p>
    </div>
  );
}

function BudgetAlerts({ summary }: { summary: SpendingSummary }) {
  const alerts = summary.by_category
    .map((cat) => ({ cat, ...budgetState(num(cat.amount), cat.budget ? num(cat.budget) : null) }))
    .filter((a) => a.level === "warn" || a.level === "over");
  const overall = budgetState(num(summary.total), summary.overall_budget ? num(summary.overall_budget) : null);
  if (alerts.length === 0 && overall.level !== "warn" && overall.level !== "over") return null;

  const line = (name: string, ratio: number) =>
    ratio > 1 ? `${name} is ${((ratio - 1) * 100).toFixed(0)}% over budget` : `${name} is at ${(ratio * 100).toFixed(0)}% of budget`;

  return (
    <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <ul className="flex flex-col gap-0.5">
        {(overall.level === "warn" || overall.level === "over") && <li>{line("Your overall spending", overall.ratio)}</li>}
        {alerts.map((a) => (
          <li key={a.cat.category_id ?? "none"}>{line(a.cat.name, a.ratio)}</li>
        ))}
      </ul>
    </div>
  );
}

function CategoryBreakdown({ summary }: { summary: SpendingSummary }) {
  const total = num(summary.total);
  const pace = monthProgress(summary.month);
  const rows = summary.by_category;

  return (
    <Panel className="h-full">
      <PanelHeader
        title="By category"
        description="Your share, against each budget"
        action={
          <Link href="/dashboard/spending/budgets" className="text-xs text-muted-foreground hover:text-foreground">
            Budgets
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No expenses this month.</p>
      ) : (
        <ul className="flex flex-col gap-4 text-sm">
          {rows.map((cat, i) => {
            const amount = num(cat.amount);
            const budget = cat.budget ? num(cat.budget) : null;
            return (
              <li key={cat.category_id ?? "none"} className="flex items-center gap-3">
                <CategoryIcon icon={cat.icon} color={cat.color} index={i} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{cat.name}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatMoney(amount, summary.currency)}
                      {budget ? (
                        <span className="text-xs text-muted-foreground"> / {formatMoney(budget, summary.currency)}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          · {total > 0 ? ((amount / total) * 100).toFixed(0) : 0}%
                        </span>
                      )}
                    </span>
                  </div>
                  {budget ? (
                    <BudgetBar spent={amount} budget={budget} pace={pace} color={categoryColor(cat.color, i)} />
                  ) : (
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${total > 0 ? (amount / total) * 100 : 0}%`,
                          backgroundColor: categoryColor(cat.color, i),
                        }}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function TopMerchants({ summary }: { summary: SpendingSummary }) {
  return (
    <Panel>
      <PanelHeader title="Top places" description="Where most of it went" />
      {summary.top_merchants.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <ol className="flex flex-col gap-2.5 text-sm">
          {summary.top_merchants.map((m, i) => (
            <li key={m.name} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="truncate">{m.name}</span>
                {m.count > 1 && <span className="text-xs text-muted-foreground">×{m.count}</span>}
              </span>
              <span className="tabular-nums">{formatMoney(num(m.amount), summary.currency)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function MonthTransactions({
  month,
  onOpen,
}: {
  month: string;
  onOpen: (expense: Expense) => void;
}) {
  const { from, to } = monthBounds(month);
  const { data: me } = useCurrentUser();
  const { data: expenses, isLoading } = useExpenses({ limit: 100, date_from: from, date_to: to });
  const { data: groups } = useGroups();
  const { data: categories } = useCategories();
  const groupName = useMemo(() => new Map(groups?.map((g) => [g.id, g.name])), [groups]);
  const category = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories]);

  // Only rows the user actually carries a share of count as their spending.
  const rows = (expenses ?? [])
    .map((e) => ({ e, mine: num(e.splits.find((s) => s.user_id === me?.id)?.amount_owed) }))
    .filter((r) => r.mine > 0);

  return (
    <Panel className="h-full gap-2">
      <PanelHeader
        title="Transactions"
        description={`${rows.length} this month`}
        action={
          <Link href="/dashboard/expenses" className="text-xs text-muted-foreground hover:text-foreground">
            All expenses
          </Link>
        }
      />
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Empty className="py-10">
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>No expenses this month</EmptyTitle>
          <EmptyDescription>Add one above, or describe it and let the AI draft it.</EmptyDescription>
        </Empty>
      ) : (
        <ul className="-mx-2 flex max-h-[420px] flex-col overflow-y-auto">
          {rows.map(({ e, mine }) => {
            const cat = e.category_id ? category.get(e.category_id) : undefined;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onOpen(e)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                >
                  <CategoryIcon icon={cat?.icon} color={cat?.color} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{e.description}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatDay(e.date)} · {cat?.name ?? "Uncategorized"} ·{" "}
                      {e.group_id ? groupName.get(e.group_id) ?? "Group" : e.recurring_expense_id ? "Recurring" : "Personal"}
                    </span>
                  </span>
                  <span className="flex flex-col items-end tabular-nums">
                    <span className="font-semibold">{formatMoney(mine, e.currency)}</span>
                    {e.group_id && (
                      <span className="text-xs text-muted-foreground">of {formatMoney(num(e.amount), e.currency)}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function IncomeList({
  month,
  currency,
  onOpen,
}: {
  month: string;
  currency: string;
  onOpen: (seed: IncomeSeed) => void;
}) {
  const { from, to } = monthBounds(month);
  const { data: incomes } = useIncomes({ date_from: from, date_to: to });

  return (
    <Panel>
      <PanelHeader
        title="Income"
        action={
          <button
            type="button"
            onClick={() => onOpen({ mode: "create" })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Add
          </button>
        }
      />
      {!incomes || incomes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No income recorded for this month.</p>
      ) : (
        <ul className="-mx-2 flex flex-col text-sm">
          {incomes.map((income) => (
            <li key={income.id}>
              <button
                type="button"
                onClick={() => onOpen({ mode: "edit", income })}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-muted/60"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{income.source}</span>
                  <span className="text-xs text-muted-foreground">{formatDay(income.date)}</span>
                </span>
                <span className="text-primary tabular-nums">
                  +{formatMoney(num(income.amount), income.currency || currency)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
