"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, HandCoins, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { StatSkeleton } from "@/components/dashboard/overview-skeleton";
import { Eyebrow } from "@/components/dashboard/panel";
import {
  RecordSettlementDialog,
  type SettlementPreset,
} from "@/components/settlements/record-settlement-dialog";
import { SettlePlanCard } from "@/components/settlements/settle-plan-card";
import { useDeleteSettlement } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { useSettlements } from "@/hooks/useSettlements";
import { computeBalances, formatMoney } from "@/lib/balances";
import { buildNameMap, displayName, formatDay, num } from "@/lib/people";
import type { Settlement } from "@/types";

export function SettlementsPage() {
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const { data: expenses } = useExpenses({ limit: 100 });
  const { data: settlements, isLoading, isError } = useSettlements({ limit: 100 });
  const [preset, setPreset] = useState<SettlementPreset | null>(null);
  const [groupFilter, setGroupFilter] = useState("");

  const names = useMemo(() => buildNameMap(groups), [groups]);
  const groupName = useMemo(() => new Map(groups?.map((g) => [g.id, g.name])), [groups]);
  const currency = me?.default_currency ?? "INR";

  const stats = useMemo(() => {
    if (!me || !settlements) return null;
    const b = computeBalances(expenses ?? [], settlements, me.id);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const recent = settlements.filter((s) => new Date(s.date) >= monthAgo);
    return { ...b, settledTotal: recent.reduce((s, x) => s + num(x.amount), 0), settledCount: recent.length };
  }, [me, expenses, settlements]);

  const history = (settlements ?? []).filter((s) => !groupFilter || s.group_id === groupFilter);
  const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Eyebrow>
            Across {groups?.length ?? 0} {groups?.length === 1 ? "group" : "groups"}
          </Eyebrow>
          <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
            Settle <em className="italic">up</em>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setPreset({})}
          disabled={!groups?.length}
          className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 sm:self-auto"
        >
          <HandCoins className="size-4" />
          Record a payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {!stats ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton highlight />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-card p-5">
              <Eyebrow>Owed to you</Eyebrow>
              <span className="font-display text-4xl leading-none tracking-tight text-primary lg:text-[44px]">
                {formatMoney(stats.owed, currency)}
              </span>
              <span className="text-[13px] text-muted-foreground">From {people(stats.owedByCount)}</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-card p-5">
              <Eyebrow>You owe</Eyebrow>
              <span className="font-display text-4xl leading-none tracking-tight text-destructive lg:text-[44px]">
                {formatMoney(stats.owe, currency)}
              </span>
              <span className="text-[13px] text-muted-foreground">To {people(stats.owesToCount)}</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl bg-primary p-5 text-primary-foreground shadow-[0_25px_80px_-12px_rgba(46,89,70,0.35)]">
              <Eyebrow className="text-primary-foreground/70">Settled in 30 days</Eyebrow>
              <span className="font-display text-4xl leading-none tracking-tight lg:text-[44px]">
                {formatMoney(stats.settledTotal, currency)}
              </span>
              <span className="text-[13px] text-primary-foreground/80">
                {stats.settledCount} {stats.settledCount === 1 ? "payment" : "payments"} recorded
              </span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <SettlePlanCard className="lg:col-span-3" onRecord={setPreset} />

        <section className="flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-card p-5.5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 pb-2">
            <h2 className="text-base font-semibold">History</h2>
            <select
              aria-label="Filter by group"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-card px-2 text-xs"
            >
              <option value="">All groups</option>
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          {isLoading ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="my-1.5 h-11 rounded-lg" />)
          ) : isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Couldn’t load settlements.</p>
          ) : history.length === 0 ? (
            <Empty className="py-10">
              <EmptyMedia variant="icon">
                <HandCoins />
              </EmptyMedia>
              <EmptyTitle>No payments yet</EmptyTitle>
              <EmptyDescription>Recorded payments show up here.</EmptyDescription>
            </Empty>
          ) : (
            <ul className="flex flex-col">
              {history.map((s) => (
                <SettlementRow
                  key={s.id}
                  settlement={s}
                  meId={me?.id}
                  names={names}
                  groupName={s.group_id ? groupName.get(s.group_id) : undefined}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <RecordSettlementDialog preset={preset} onOpenChange={(open) => !open && setPreset(null)} />
    </div>
  );
}

export function SettlementRow({
  settlement: s,
  meId,
  names,
  groupName,
}: {
  settlement: Settlement;
  meId?: string;
  names: Map<string, string>;
  groupName?: string;
}) {
  const deleteSettlement = useDeleteSettlement();
  const incoming = s.received_by_id === meId;
  const outgoing = s.paid_by_id === meId;
  const payer = displayName(names, s.paid_by_id, meId);
  const payee = displayName(names, s.received_by_id, meId, { you: "you" });
  const canDelete = s.created_by_id === meId || outgoing;

  const remove = async () => {
    try {
      await deleteSettlement.mutateAsync(s.id);
      toast.success("Payment removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove payment");
    }
  };

  return (
    <li className="group flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          outgoing ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        )}
      >
        {outgoing ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">
          {payer} paid {payee}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {[groupName, formatDay(s.date), s.note && `“${s.note}”`].filter(Boolean).join(" · ")}
        </span>
      </div>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          incoming && "text-primary",
        )}
      >
        {incoming ? "+" : outgoing ? "−" : ""}
        {formatMoney(num(s.amount), s.currency)}
      </span>
      {canDelete && (
        <button
          type="button"
          onClick={remove}
          disabled={deleteSettlement.isPending}
          aria-label="Remove payment"
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-destructive focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </li>
  );
}
