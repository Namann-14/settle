"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { cn } from "@settle/ui/lib/utils";

import {
  FigureStrip,
  FigureStripSkeleton,
  PageHeader,
  Panel,
  PanelHeader,
  buttonClass,
  rowClass,
  type Figure,
} from "@/components/dashboard/panel";
import { AiQuickAdd } from "@/components/expenses/ai-quick-add";
import { ExpenseSheet, type ExpenseSheetSeed } from "@/components/expenses/expense-sheet";
import { BudgetBar, budgetState } from "@/components/spending/budget-bar";
import { CategoryIcon, categoryColor } from "@/components/spending/category-icon";
import { IncomeDialog, type IncomeSeed } from "@/components/spending/income-dialog";
import {
  EmptyLine,
  LoadError,
  PanelSkeleton,
  RowsSkeleton,
  quietLinkClass,
} from "@/components/spending/states";
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
  { ssr: false, loading: () => <PanelSkeleton variant="chart" className="h-full" /> },
);
const TrendChart = dynamic(
  () => import("@/components/spending/spending-charts").then((m) => m.TrendChart),
  { ssr: false, loading: () => <PanelSkeleton variant="chart" /> },
);

const monthHref = (month: string) =>
  (month === currentMonth() ? "/dashboard/spending" : `/dashboard/spending?month=${month}`) as Route;

export function SpendingOverview({ month }: { month: string }) {
  const { data: summary, isLoading, isError, refetch } = useSpendingSummary(month);
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const [incomeSeed, setIncomeSeed] = useState<IncomeSeed | null>(null);

  return (
    <>
      <PageHeader
        title="Spending"
        description="Your share of everything you spend, personal and in groups."
        actions={
          <>
            <button
              type="button"
              onClick={() => setIncomeSeed({ mode: "create" })}
              className={buttonClass({ variant: "secondary" })}
            >
              Add income
            </button>
            <button
              type="button"
              onClick={() => setSeed({ mode: "create", groupId: null })}
              className={buttonClass()}
            >
              <Plus />
              Add expense
            </button>
          </>
        }
      />

      <AiQuickAdd onDraft={(draft) => setSeed({ mode: "draft", draft })} />

      <div className="flex flex-col gap-4">
        <MonthStepper month={month} />
        {isLoading ? (
          <OverviewSkeleton />
        ) : isError || !summary ? (
          <Panel>
            <LoadError what={`your spending for ${monthLabel(month)}`} onRetry={() => refetch()} />
          </Panel>
        ) : (
          <div className="flex animate-fade-in flex-col gap-4">
            <Figures summary={summary} />
            <BudgetAlerts summary={summary} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <DailySpendChart summary={summary} />
              </div>
              <CategoryBreakdown summary={summary} />
              <div className="min-w-0 lg:col-span-2">
                <MonthTransactions month={month} onOpen={(expense) => setSeed({ mode: "edit", expense })} />
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                <TopMerchants summary={summary} />
                <IncomeList month={month} currency={summary.currency} onOpen={setIncomeSeed} />
              </div>
              <div className="min-w-0 lg:col-span-3">
                <TrendChart summary={summary} />
              </div>
            </div>
          </div>
        )}
      </div>

      <ExpenseSheet seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
      <IncomeDialog seed={incomeSeed} onOpenChange={(open) => !open && setIncomeSeed(null)} />
    </>
  );
}

/** Previous / current / next month, in the same pill track as the filters. */
function MonthStepper({ month }: { month: string }) {
  const atLatest = month >= currentMonth();
  const step =
    "flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:size-8";

  return (
    <nav
      aria-label="Month"
      className="inline-flex items-center gap-0.5 self-start rounded-full border border-border bg-card p-0.5"
    >
      <Link href={monthHref(shiftMonth(month, -1))} aria-label="Previous month" className={step}>
        <ChevronLeft className="size-4" />
      </Link>
      <span aria-live="polite" className="min-w-32 px-1 text-center text-meta font-medium">
        {monthLabel(month)}
      </span>
      <Link
        href={monthHref(shiftMonth(month, 1))}
        aria-label="Next month"
        aria-disabled={atLatest}
        tabIndex={atLatest ? -1 : undefined}
        className={cn(step, atLatest && "pointer-events-none opacity-30")}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-busy aria-label="Loading spending" className="flex flex-col gap-4">
      <FigureStripSkeleton count={4} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelSkeleton variant="chart" className="lg:col-span-2" />
        <PanelSkeleton rows={4} />
      </div>
    </div>
  );
}

function Figures({ summary }: { summary: SpendingSummary }) {
  const c = summary.currency;
  const total = num(summary.total);
  const previous = num(summary.previous_total);
  // Only compare complete months; mid-month the change is meaningless.
  const change = previous > 0 && monthProgress(summary.month) >= 1 ? ((total - previous) / previous) * 100 : null;
  const budget = summary.overall_budget ? num(summary.overall_budget) : null;
  const income = num(summary.income_total);
  const net = num(summary.net);
  const pace = monthProgress(summary.month);

  const figures: Figure[] = [
    {
      label: "Spent",
      value: formatMoney(total, c),
      money: true,
      hint:
        change === null
          ? `${summary.expense_count} ${summary.expense_count === 1 ? "expense" : "expenses"}${previous > 0 ? ` · ${formatMoney(previous, c)} in ${monthLabel(shiftMonth(summary.month, -1), { short: true })}` : ""}`
          : `${change > 0 ? "+" : ""}${change.toFixed(0)}% vs ${monthLabel(shiftMonth(summary.month, -1), { short: true })}`,
    },
    budget
      ? {
          label: "Budget left",
          value: formatMoney(budget - total, c, { signed: budget - total < 0 }),
          money: true,
          tone: budget - total < 0 ? "negative" : undefined,
          hint: <BudgetBar spent={total} budget={budget} pace={pace} className="mt-1.5" />,
        }
      : {
          label: "Budget",
          value: "Not set",
          tone: "muted",
          hint: (
            <Link href="/dashboard/spending/budgets" className={quietLinkClass}>
              Set a monthly budget
            </Link>
          ),
        },
    {
      label: "Income",
      value: formatMoney(income, c),
      money: true,
      hint: income > 0 ? "Recorded this month" : "None recorded",
    },
    {
      label: income > 0 && net < 0 ? "Overspent" : "Saved",
      value: income > 0 ? formatMoney(net, c) : "—",
      money: income > 0,
      tone: income > 0 ? (net >= 0 ? "positive" : "negative") : "muted",
      hint: income > 0 ? `${((net / income) * 100).toFixed(0)}% of income` : "Add income to see savings",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <FigureStrip figures={figures} />
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
  const overallAlert = overall.level === "warn" || overall.level === "over";
  if (alerts.length === 0 && !overallAlert) return null;

  const anyOver = overall.level === "over" || alerts.some((a) => a.level === "over");
  const line = (name: string, ratio: number) =>
    ratio > 1 ? `${name} is ${((ratio - 1) * 100).toFixed(0)}% over budget` : `${name} is at ${(ratio * 100).toFixed(0)}% of budget`;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-3 text-meta md:px-6"
    >
      <AlertTriangle
        className={cn("mt-0.5 size-4 shrink-0", anyOver ? "text-destructive" : "text-muted-foreground")}
        aria-hidden
      />
      <ul className="flex flex-col gap-0.5">
        {overallAlert && (
          <li className={cn(overall.level === "over" && "text-destructive")}>
            {line("Your overall spending", overall.ratio)}
          </li>
        )}
        {alerts.map((a) => (
          <li key={a.cat.category_id ?? "none"} className={cn(a.level === "over" && "text-destructive")}>
            {line(a.cat.name, a.ratio)}
          </li>
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
    <Panel className="h-full min-w-0 gap-2">
      <PanelHeader
        title="By category"
        description="Your share, against each budget"
        action={
          <Link href="/dashboard/spending/budgets" className={quietLinkClass}>
            Budgets
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyLine>Nothing spent yet. Add an expense to see where it goes.</EmptyLine>
      ) : (
        <ul className="flex flex-col">
          {rows.map((cat, i) => {
            const amount = num(cat.amount);
            const budget = cat.budget ? num(cat.budget) : null;
            return (
              <li key={cat.category_id ?? "none"} className={cn(rowClass, "justify-start gap-3")}>
                <CategoryIcon icon={cat.icon} color={cat.color} index={i} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{cat.name}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatMoney(amount, summary.currency)}
                      <span className="text-xs text-muted-foreground">
                        {budget
                          ? ` / ${formatMoney(budget, summary.currency)}`
                          : ` · ${total > 0 ? ((amount / total) * 100).toFixed(0) : 0}%`}
                      </span>
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
    <Panel className="gap-2">
      <PanelHeader title="Top places" description="Where most of it went" />
      {summary.top_merchants.length === 0 ? (
        <EmptyLine>Places show up here as you add expenses.</EmptyLine>
      ) : (
        <ol className="flex flex-col">
          {summary.top_merchants.map((m, i) => (
            <li key={m.name} className={rowClass}>
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="truncate">{m.name}</span>
                {m.count > 1 && <span className="shrink-0 text-xs text-muted-foreground">×{m.count}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{formatMoney(num(m.amount), summary.currency)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function MonthTransactions({ month, onOpen }: { month: string; onOpen: (expense: Expense) => void }) {
  const { from, to } = monthBounds(month);
  const { data: me } = useCurrentUser();
  const { data: expenses, isLoading, isError, refetch } = useExpenses({ limit: 100, date_from: from, date_to: to });
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
        description={isLoading || isError ? monthLabel(month) : `${rows.length} in ${monthLabel(month)}`}
        action={
          <Link href="/dashboard/expenses" className={quietLinkClass}>
            All expenses
          </Link>
        }
      />
      {isLoading ? (
        <RowsSkeleton rows={5} icon />
      ) : isError ? (
        <LoadError what="this month’s expenses" onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyLine>No expenses this month. Add one, or describe it to Settle AI above.</EmptyLine>
      ) : (
        <ul className="-mx-2 flex max-h-[420px] animate-fade-in flex-col overflow-y-auto">
          {rows.map(({ e, mine }) => {
            const cat = e.category_id ? category.get(e.category_id) : undefined;
            return (
              <li key={e.id} className="border-b border-border/50 last:border-b-0">
                <button
                  type="button"
                  onClick={() => onOpen(e)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <CategoryIcon icon={cat?.icon} color={cat?.color} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{e.description}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatDay(e.date)} · {cat?.name ?? "Uncategorized"} ·{" "}
                      {e.group_id ? groupName.get(e.group_id) ?? "Group" : e.recurring_expense_id ? "Recurring" : "Personal"}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end tabular-nums">
                    <span className="font-medium">{formatMoney(mine, e.currency)}</span>
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
  const { data: incomes, isLoading, isError, refetch } = useIncomes({ date_from: from, date_to: to });

  return (
    <Panel className="gap-2">
      <PanelHeader
        title="Income"
        action={
          <button type="button" onClick={() => onOpen({ mode: "create" })} className={quietLinkClass}>
            Add
          </button>
        }
      />
      {isLoading ? (
        <RowsSkeleton rows={2} />
      ) : isError ? (
        <LoadError what="your income" onRetry={() => refetch()} />
      ) : !incomes || incomes.length === 0 ? (
        <EmptyLine>No income this month. Add it to see what you saved.</EmptyLine>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {incomes.map((income) => (
            <li key={income.id} className="border-b border-border/50 last:border-b-0">
              <button
                type="button"
                onClick={() => onOpen({ mode: "edit", income })}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left text-sm transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{income.source}</span>
                  <span className="text-xs text-muted-foreground">{formatDay(income.date)}</span>
                </span>
                <span className="shrink-0 text-primary tabular-nums">
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
