"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import {
  FigureStrip,
  FigureStripSkeleton,
  PageContainer,
  PageHeader,
  SearchField,
  Segmented,
  buttonClass,
} from "@/components/dashboard/panel";
import { AiQuickAdd } from "@/components/expenses/ai-quick-add";
import { ExpenseSheet, type ExpenseSheetSeed } from "@/components/expenses/expense-sheet";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { formatMoney } from "@/lib/balances";
import { buildNameMap, displayName, formatDay, num } from "@/lib/people";
import type { Expense, ListExpensesParams } from "@/types";

const RANGES = [
  { id: "7", label: "7 days", long: "Last 7 days" },
  { id: "30", label: "30 days", long: "Last 30 days" },
  { id: "90", label: "90 days", long: "Last 90 days" },
  { id: "all", label: "All time", long: "All time" },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

const SPLIT_NAMES = { EQUAL: "equal split", UNEQUAL: "exact split", PERCENTAGE: "percent split" };
const LIMIT = 100;

const filterSelectClass =
  "h-10 min-w-0 flex-1 truncate rounded-full border border-border bg-card px-3.5 text-meta text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:h-9 sm:flex-none";

// One grid for the header and every row, from lg up. Below lg rows stack.
const tableCols = "lg:grid-cols-[5.5rem_minmax(0,1fr)_8rem_7.5rem_8.5rem]";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** What this expense does to the user's balance: + lent, − owed. */
export function myImpact(expense: Expense, meId: string | undefined) {
  if (!meId) return 0;
  const mine = num(expense.splits.find((s) => s.user_id === meId)?.amount_owed);
  return expense.paid_by_id === meId ? num(expense.amount) - mine : -mine;
}

function Impact({ value, currency, className }: { value: number; currency: string; className?: string }) {
  if (Math.abs(value) < 0.005) return null;
  return (
    <span className={cn("text-xs tabular-nums", value > 0 ? "text-primary" : "text-destructive", className)}>
      {value > 0 ? "you lent " : "you borrowed "}
      {formatMoney(Math.abs(value), currency)}
    </span>
  );
}

function LedgerSkeleton() {
  return (
    <div aria-busy aria-label="Loading expenses">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/50 px-5 py-3.5 last:border-b-0 md:px-6",
            tableCols,
          )}
        >
          <Skeleton className="hidden h-3.5 w-14 rounded-full lg:block" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-2/5 rounded-full" />
            <Skeleton className="h-3 w-1/4 rounded-full" />
          </div>
          <Skeleton className="hidden h-3.5 w-16 rounded-full lg:block" />
          <Skeleton className="h-3.5 w-16 justify-self-end rounded-full" />
          <Skeleton className="hidden h-3.5 w-16 justify-self-end rounded-full lg:block" />
        </div>
      ))}
    </div>
  );
}

export function ExpensesPage() {
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const { data: categories } = useCategories();
  const [q, setQ] = useState("");
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [payer, setPayer] = useState<"" | "me">("");
  const [range, setRange] = useState<RangeId>("30");
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const deferredQ = useDeferredValue(q.trim());

  // The group filter doubles as a scope filter: "personal" and "group" are
  // pseudo-ids that map to ?scope=, anything else is a real group id.
  const scope = groupId === "personal" || groupId === "group" ? groupId : undefined;
  const params: ListExpensesParams = {
    limit: LIMIT,
    group_id: (!scope && groupId) || undefined,
    scope,
    category_id: categoryId || undefined,
    paid_by_id: payer === "me" ? me?.id : undefined,
    q: deferredQ || undefined,
    date_from: range === "all" ? undefined : isoDaysAgo(Number(range)),
  };
  const { data: expenses, isLoading, isError, refetch } = useExpenses(params);

  const names = useMemo(() => buildNameMap(groups), [groups]);
  const groupName = useMemo(() => new Map(groups?.map((g) => [g.id, g.name])), [groups]);
  const categoryName = useMemo(() => new Map(categories?.map((c) => [c.id, c.name])), [categories]);
  const currency = me?.default_currency ?? "INR";
  const rangeLabel = RANGES.find((r) => r.id === range)?.long ?? "";
  const filtered = Boolean(q.trim() || groupId || categoryId || payer || range !== "30");

  const totals = useMemo(() => {
    let share = 0;
    let paid = 0;
    for (const e of expenses ?? []) {
      share += num(e.splits.find((s) => s.user_id === me?.id)?.amount_owed);
      if (e.paid_by_id === me?.id) paid += num(e.amount);
    }
    return { share, paid };
  }, [expenses, me]);

  const where = (e: Expense) => (e.group_id ? groupName.get(e.group_id) ?? "Group" : "Personal");
  const category = (e: Expense) => (e.category_id && categoryName.get(e.category_id)) || "Uncategorized";

  let ledger: React.ReactNode;
  if (isLoading) ledger = <LedgerSkeleton />;
  else if (isError)
    ledger = (
      <p className="px-5 py-4 text-sm text-muted-foreground md:px-6">
        Couldn’t load expenses.{" "}
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Try again
        </button>
      </p>
    );
  else if (!expenses || expenses.length === 0)
    ledger = (
      <p className="px-5 py-4 text-sm text-muted-foreground md:px-6">
        {filtered
          ? "No expenses match these filters. Try a longer date range or a different search."
          : "No expenses in the last 30 days. Describe one above and Settle AI will draft it."}
      </p>
    );
  else
    ledger = (
      <ul className="animate-fade-in">
        {expenses.map((e) => {
          const impact = myImpact(e, me?.id);
          const share = e.splits.find((s) => s.user_id === me?.id);
          const payerName = displayName(names, e.paid_by_id, me?.id);
          return (
            <li key={e.id} className="border-b border-border/50 last:border-b-0">
              <button
                type="button"
                onClick={() => setSeed({ mode: "edit", expense: e })}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-3 text-left text-sm transition-colors duration-150 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset md:px-6",
                  tableCols,
                )}
              >
                <span className="hidden text-muted-foreground tabular-nums lg:block">{formatDay(e.date)}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{e.description}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    <span className="lg:hidden">
                      {formatDay(e.date)} · {payerName} paid ·{" "}
                    </span>
                    {where(e)} · {category(e)}
                    <span className="hidden lg:inline"> · {SPLIT_NAMES[e.split_type]}</span>
                  </span>
                </span>
                <span className="hidden truncate lg:block">{payerName}</span>
                <span className="flex flex-col items-end lg:block lg:text-right">
                  <span className="font-medium tabular-nums">{formatMoney(num(e.amount), e.currency)}</span>
                  <Impact value={impact} currency={e.currency} className="lg:hidden" />
                </span>
                <span className="hidden flex-col items-end lg:flex">
                  <span className="tabular-nums">
                    {share ? formatMoney(num(share.amount_owed), e.currency) : <span className="text-muted-foreground">—</span>}
                  </span>
                  <Impact value={impact} currency={e.currency} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );

  return (
    <PageContainer>
      <PageHeader
        title="Expenses"
        description="Every expense you’re part of, personal and shared. Tap one to see or edit it."
        actions={
          <button
            type="button"
            onClick={() =>
              setSeed({ mode: "create", groupId: scope === "personal" ? null : (!scope && groupId) || groups?.[0]?.id })
            }
            className={buttonClass({ variant: "secondary" })}
          >
            <Plus />
            Add manually
          </button>
        }
      />

      <AiQuickAdd onDraft={(draft) => setSeed({ mode: "draft", draft })} />

      {isLoading ? (
        <FigureStripSkeleton count={3} />
      ) : expenses && !isError ? (
        <FigureStrip
          className="animate-fade-in"
          figures={[
            { label: "Your share", value: formatMoney(totals.share, currency), hint: rangeLabel, money: true },
            { label: "You paid", value: formatMoney(totals.paid, currency), hint: rangeLabel, money: true },
            {
              label: "Expenses",
              value: expenses.length,
              hint: expenses.length >= LIMIT ? `Showing the latest ${LIMIT}` : filtered ? "Matching your filters" : rangeLabel,
            },
          ]}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder="Search description or merchant"
            icon={<Search className="size-3.5 shrink-0" />}
            className="lg:w-72"
          />
          <Segmented
            label="Date range"
            options={RANGES}
            value={range}
            onChange={setRange}
            className="self-start"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Group" value={groupId} onChange={(e) => setGroupId(e.target.value)} className={filterSelectClass}>
            <option value="">Personal and groups</option>
            <option value="personal">Personal only</option>
            <option value="group">Groups only</option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Any category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Paid by"
            value={payer}
            onChange={(e) => setPayer(e.target.value as "" | "me")}
            className={filterSelectClass}
          >
            <option value="">Paid by anyone</option>
            <option value="me">Paid by you</option>
          </select>
        </div>
      </div>

      <section aria-label="Expenses" className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          aria-hidden
          className={cn(
            "hidden gap-4 border-b border-border px-5 py-2.5 text-xs text-muted-foreground md:px-6 lg:grid",
            tableCols,
          )}
        >
          <span>Date</span>
          <span>Description</span>
          <span>Paid by</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Your share</span>
        </div>
        {ledger}
      </section>

      <ExpenseSheet seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
    </PageContainer>
  );
}
