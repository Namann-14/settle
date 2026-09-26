"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Receipt, Search } from "lucide-react";

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Eyebrow } from "@/components/dashboard/panel";
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
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "all", label: "All time" },
] as const;

const SPLIT_NAMES = { EQUAL: "equal split", UNEQUAL: "exact split", PERCENTAGE: "percent split" };

const filterClass =
  "h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground outline-none focus-visible:border-ring";

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

export function ExpensesPage() {
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const { data: categories } = useCategories();
  const [q, setQ] = useState("");
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [payer, setPayer] = useState<"" | "me">("");
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30");
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const deferredQ = useDeferredValue(q.trim());

  // The group filter doubles as a scope filter: "personal" and "group" are
  // pseudo-ids that map to ?scope=, anything else is a real group id.
  const scope = groupId === "personal" || groupId === "group" ? groupId : undefined;
  const params: ListExpensesParams = {
    limit: 100,
    group_id: (!scope && groupId) || undefined,
    scope,
    category_id: categoryId || undefined,
    paid_by_id: payer === "me" ? me?.id : undefined,
    q: deferredQ || undefined,
    date_from: range === "all" ? undefined : isoDaysAgo(Number(range)),
  };
  const { data: expenses, isLoading, isError } = useExpenses(params);

  const names = useMemo(() => buildNameMap(groups), [groups]);
  const groupName = useMemo(() => new Map(groups?.map((g) => [g.id, g.name])), [groups]);
  const categoryName = useMemo(() => new Map(categories?.map((c) => [c.id, c.name])), [categories]);
  const currency = me?.default_currency ?? "INR";

  const myShare = useMemo(
    () =>
      (expenses ?? []).reduce(
        (sum, e) => sum + num(e.splits.find((s) => s.user_id === me?.id)?.amount_owed),
        0,
      ),
    [expenses, me],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Eyebrow>
            {RANGES.find((r) => r.id === range)?.label} · your share {formatMoney(myShare, currency)}
          </Eyebrow>
          <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
            All <em className="italic">expenses</em>
          </h1>
        </div>
        <button
          type="button"
          onClick={() =>
            setSeed({ mode: "create", groupId: scope === "personal" ? null : (!scope && groupId) || groups?.[0]?.id })
          }
          className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors hover:bg-muted sm:self-auto"
        >
          <Plus className="size-4" />
          Add manually
        </button>
      </div>

      <AiQuickAdd onDraft={(draft) => setSeed({ mode: "draft", draft })} />

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-[13px] text-muted-foreground focus-within:border-ring sm:w-72">
          <Search className="size-3.5" />
          <span className="sr-only">Search expenses</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search description or merchant"
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select aria-label="Group" value={groupId} onChange={(e) => setGroupId(e.target.value)} className={filterClass}>
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
          className={filterClass}
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
          className={filterClass}
        >
          <option value="">Paid by anyone</option>
          <option value="me">Paid by you</option>
        </select>
        <select
          aria-label="Date range"
          value={range}
          onChange={(e) => setRange(e.target.value as typeof range)}
          className={filterClass}
        >
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="hidden grid-cols-[96px_minmax(0,1fr)_150px_130px_110px_120px] gap-4 bg-sidebar px-5 py-3 text-xs tracking-[0.06em] text-muted-foreground uppercase md:grid">
          <span>Date</span>
          <span>Description</span>
          <span>Group</span>
          <span>Paid by</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Your share</span>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <Empty className="py-14">
            <EmptyTitle>Couldn&apos;t load expenses</EmptyTitle>
            <EmptyDescription>Try refreshing the page.</EmptyDescription>
          </Empty>
        ) : !expenses || expenses.length === 0 ? (
          <Empty className="py-14">
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>No expenses here</EmptyTitle>
            <EmptyDescription>Describe one above and the AI will draft it for you.</EmptyDescription>
          </Empty>
        ) : (
          <ul>
            {expenses.map((e) => {
              const impact = myImpact(e, me?.id);
              return (
                <li key={e.id} className="border-t border-border/50 first:border-t-0 md:first:border-t">
                  <button
                    type="button"
                    onClick={() => setSeed({ mode: "edit", expense: e })}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-5 py-3.5 text-left text-sm transition-colors hover:bg-muted/50 md:grid-cols-[96px_minmax(0,1fr)_150px_130px_110px_120px]"
                  >
                    <span className="hidden text-muted-foreground md:block">{formatDay(e.date)}</span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">{e.description}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        <span className="md:hidden">{formatDay(e.date)} · </span>
                        {(e.category_id && categoryName.get(e.category_id)) || "Uncategorized"} ·{" "}
                        {SPLIT_NAMES[e.split_type]}
                      </span>
                    </span>
                    <span className="hidden truncate md:block">
                      {e.group_id ? groupName.get(e.group_id) ?? "Group" : "Personal"}
                    </span>
                    <span className="hidden truncate md:block">{displayName(names, e.paid_by_id, me?.id)}</span>
                    <span className="hidden text-right font-semibold tabular-nums md:block">
                      {formatMoney(num(e.amount), e.currency)}
                    </span>
                    <span
                      className={cn(
                        "text-right tabular-nums",
                        impact > 0.005 ? "text-primary" : impact < -0.005 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      <span className="block font-semibold text-foreground md:hidden">
                        {formatMoney(num(e.amount), e.currency)}
                      </span>
                      {Math.abs(impact) < 0.005 ? "—" : formatMoney(impact, e.currency, { signed: true })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ExpenseSheet seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
    </div>
  );
}
