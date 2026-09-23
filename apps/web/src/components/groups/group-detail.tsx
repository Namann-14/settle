"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, Mail, MessageCircle, Receipt, Sparkles, UserMinus, X } from "lucide-react";
import { toast } from "sonner";

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { AiQuickAdd } from "@/components/expenses/ai-quick-add";
import { ExpenseSheet, type ExpenseSheetSeed } from "@/components/expenses/expense-sheet";
import { myImpact } from "@/components/expenses/expenses-page";
import { controlClass } from "@/components/forms/field";
import {
  RecordSettlementDialog,
  type SettlementPreset,
} from "@/components/settlements/record-settlement-dialog";
import { SettlePlanCard } from "@/components/settlements/settle-plan-card";
import { SettlementRow } from "@/components/settlements/settlements-page";
import { useCancelInvitation, useInviteMember, useRemoveMember } from "@/hooks/mutations";
import { useGroupInsight } from "@/hooks/useAi";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroup, useGroupBalances, useGroupInvitations } from "@/hooks/useGroup";
import { useSettlements } from "@/hooks/useSettlements";
import { formatMoney } from "@/lib/balances";
import { buildNameMap, displayName, formatDay, initials, num } from "@/lib/people";
import type { Expense, Group } from "@/types";

type Tab = "expenses" | "settlements" | "members";

export function GroupDetail({ groupId }: { groupId: string }) {
  const { data: group, isLoading, isError, error } = useGroup(groupId);
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("expenses");
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const [preset, setPreset] = useState<SettlementPreset | null>(null);

  if (isLoading) return <GroupDetailSkeleton />;
  if (isError || !group) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-10 md:px-4">
        <Empty className="rounded-2xl border border-border/70 bg-card py-16">
          <EmptyTitle>Group not found</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error ? error.message : "It may have been deleted, or you’re not a member."}
          </EmptyDescription>
          <Link href="/dashboard/groups" className="text-sm font-medium text-primary hover:underline">
            Back to groups
          </Link>
        </Empty>
      </div>
    );
  }

  const active = group.members.filter((m) => !m.removed_at);
  const isAdmin = active.some((m) => m.user_id === me?.id && m.role === "ADMIN");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <Link
        href="/dashboard/groups"
        className="flex items-center gap-1 self-start text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        All groups
      </Link>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl font-semibold text-primary">
            {initials(group.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="truncate font-display text-4xl leading-none tracking-tight md:text-5xl">
              {group.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {active.length} {active.length === 1 ? "member" : "members"} · {group.default_currency}
              {group.description ? ` · ${group.description}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setPreset({ groupId: group.id })}
            className="h-11 rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Settle up
          </button>
          <button
            type="button"
            onClick={() => setSeed({ mode: "create", groupId: group.id })}
            className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
          >
            Add expense
          </button>
        </div>
      </div>

      <AiQuickAdd groupId={group.id} onDraft={(draft) => setSeed({ mode: "draft", draft })} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div role="tablist" className="flex gap-1 self-start rounded-xl bg-muted p-1">
            {(["expenses", "settlements", "members"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "h-9 rounded-[9px] px-4 text-[13px] capitalize transition-colors",
                  tab === t
                    ? "bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "expenses" && (
            <GroupExpenses group={group} meId={me?.id} onOpen={(e) => setSeed({ mode: "edit", expense: e })} />
          )}
          {tab === "settlements" && <GroupSettlements group={group} meId={me?.id} />}
          {tab === "members" && <GroupMembers group={group} meId={me?.id} isAdmin={isAdmin} />}
        </div>

        <div className="flex flex-col gap-4">
          <BalancesPanel group={group} meId={me?.id} />
          <GroupInsightCard groupId={group.id} />
        </div>
      </div>

      <SettlePlanCard groupId={group.id} onRecord={setPreset} />

      <ExpenseSheet seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
      <RecordSettlementDialog preset={preset} onOpenChange={(open) => !open && setPreset(null)} />
    </div>
  );
}

function GroupExpenses({
  group,
  meId,
  onOpen,
}: {
  group: Group;
  meId?: string;
  onOpen: (e: Expense) => void;
}) {
  const { data: expenses, isLoading } = useExpenses({ group_id: group.id, limit: 100 });
  const { data: categories } = useCategories();
  const names = useMemo(() => buildNameMap([group]), [group]);
  const categoryName = useMemo(() => new Map(categories?.map((c) => [c.id, c.name])), [categories]);

  if (isLoading) return <ListSkeleton />;
  if (!expenses?.length) {
    return (
      <Empty className="rounded-2xl border border-border/70 bg-card py-14">
        <EmptyMedia variant="icon">
          <Receipt />
        </EmptyMedia>
        <EmptyTitle>No expenses yet</EmptyTitle>
        <EmptyDescription>Describe one above, or use Add expense.</EmptyDescription>
      </Empty>
    );
  }

  return (
    <ul className="rounded-2xl border border-border/70 bg-card px-5 py-1.5">
      {expenses.map((e) => {
        const impact = myImpact(e, meId);
        return (
          <li key={e.id} className="border-b border-border/50 last:border-b-0">
            <button
              type="button"
              onClick={() => onOpen(e)}
              className="flex w-full items-center gap-3.5 py-3.5 text-left"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                <Receipt className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{e.description}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayName(names, e.paid_by_id, meId)} paid ·{" "}
                  {(e.category_id && categoryName.get(e.category_id)) || "Uncategorized"} · {formatDay(e.date)}
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-semibold tabular-nums">{formatMoney(num(e.amount), e.currency)}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    impact > 0.005 ? "text-primary" : impact < -0.005 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {impact > 0.005
                    ? `you lent ${formatMoney(impact, e.currency)}`
                    : impact < -0.005
                      ? `you owe ${formatMoney(-impact, e.currency)}`
                      : "not involved"}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function GroupSettlements({ group, meId }: { group: Group; meId?: string }) {
  const { data: settlements, isLoading } = useSettlements({ group_id: group.id, limit: 100 });
  const names = useMemo(() => buildNameMap([group]), [group]);

  if (isLoading) return <ListSkeleton />;
  if (!settlements?.length) {
    return (
      <Empty className="rounded-2xl border border-border/70 bg-card py-14">
        <EmptyTitle>No payments yet</EmptyTitle>
        <EmptyDescription>Use Settle up to record one.</EmptyDescription>
      </Empty>
    );
  }
  return (
    <ul className="rounded-2xl border border-border/70 bg-card px-5 py-1">
      {settlements.map((s) => (
        <SettlementRow key={s.id} settlement={s} meId={meId} names={names} />
      ))}
    </ul>
  );
}

function GroupMembers({ group, meId, isAdmin }: { group: Group; meId?: string; isAdmin: boolean }) {
  const { data: invitations } = useGroupInvitations(group.id);
  const invite = useInviteMember(group.id);
  const remove = useRemoveMember(group.id);
  const cancel = useCancelInvitation(group.id);
  const [email, setEmail] = useState("");
  const active = group.members.filter((m) => !m.removed_at);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await invite.mutateAsync({ email: email.trim() });
      toast.success(res.status === "added" ? "Added to the group" : "Invite pending until they sign up");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add that person");
    }
  };

  const removeMember = async (memberId: string, self: boolean) => {
    try {
      await remove.mutateAsync(memberId);
      toast.success(self ? "You left the group" : "Member removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove member");
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5">
      <form onSubmit={submit} className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Email to invite</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add someone by email"
            className={controlClass}
          />
        </label>
        <button
          type="submit"
          disabled={invite.isPending}
          className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {invite.isPending ? "Adding…" : "Add"}
        </button>
      </form>

      <ul className="flex flex-col">
        {active.map((m) => {
          const self = m.user_id === meId;
          return (
            <li key={m.id} className="flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                {initials(m.user_name ?? m.user_email)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {self ? "You" : m.user_name || m.user_email || "Member"}
                </span>
                {m.user_email && <span className="truncate text-xs text-muted-foreground">{m.user_email}</span>}
              </span>
              {m.role === "ADMIN" && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Admin</span>
              )}
              {(isAdmin || self) && (
                <button
                  type="button"
                  onClick={() => removeMember(m.id, self)}
                  disabled={remove.isPending}
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <UserMinus className="size-3.5" />
                  {self ? "Leave" : "Remove"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {invitations && invitations.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-[0.08em] text-muted-foreground uppercase">Pending invites</span>
          <ul className="flex flex-col gap-1.5">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{inv.email}</span>
                <button
                  type="button"
                  onClick={() => cancel.mutate(inv.id)}
                  aria-label={`Cancel invite for ${inv.email}`}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BalancesPanel({ group, meId }: { group: Group; meId?: string }) {
  const { data: balances, isLoading, isError } = useGroupBalances(group.id);
  const label = (userId: string) => {
    if (userId === meId) return "You";
    const m = balances?.members.find((x) => x.user_id === userId);
    return m?.user_name || m?.user_email || "Member";
  };

  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border border-border/70 bg-card p-5.5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Balances</h2>
        <span className="text-[13px] text-muted-foreground">Net position of each member</span>
      </div>
      {isLoading ? (
        [0, 1, 2].map((i) => <Skeleton key={i} className="h-8 rounded-lg" />)
      ) : isError || !balances ? (
        <p className="text-sm text-muted-foreground">Couldn’t load balances.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {balances.members.map((m) => {
              const net = num(m.net);
              return (
                <li key={m.user_id} className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-primary">
                    {initials(m.user_name ?? m.user_email)}
                  </span>
                  <span className="flex-1 truncate text-sm">{label(m.user_id)}</span>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      net > 0.005 ? "text-primary" : net < -0.005 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {Math.abs(net) < 0.005 ? "Settled" : formatMoney(net, balances.currency, { signed: true })}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-2.5 border-t border-border/50 pt-3.5">
            <span className="text-xs tracking-[0.08em] text-muted-foreground uppercase">
              {balances.transfers.length === 0
                ? "Everyone’s square"
                : `Simplest way to settle · ${balances.transfers.length} ${balances.transfers.length === 1 ? "payment" : "payments"}`}
            </span>
            {balances.transfers.map((t) => (
              <div key={`${t.from_user_id}-${t.to_user_id}`} className="flex items-center gap-2 text-[13px]">
                <span className="font-medium">{label(t.from_user_id)}</span>
                <span className="text-muted-foreground">{t.from_user_id === meId ? "pay" : "pays"}</span>
                <span className="font-medium">{label(t.to_user_id)}</span>
                <span className="ml-auto font-semibold tabular-nums">
                  {formatMoney(num(t.amount), balances.currency)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function GroupInsightCard({ groupId }: { groupId: string }) {
  const { data: insight, isLoading, isError } = useGroupInsight(groupId);

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[oklch(0.32_0.045_162)] p-5.5 text-[oklch(0.95_0.012_160)]">
      <span className="flex items-center gap-2 text-xs tracking-[0.08em] text-[oklch(0.8_0.04_158)] uppercase">
        <Sparkles className="size-3.5" />
        Settle AI · group insight
      </span>
      {isLoading ? (
        <>
          <Skeleton className="h-6 w-full rounded-lg bg-white/10" />
          <Skeleton className="h-6 w-3/4 rounded-lg bg-white/10" />
        </>
      ) : isError || !insight ? (
        <p className="text-sm text-[oklch(0.85_0.03_158)]">Insights aren’t available right now.</p>
      ) : (
        <>
          <p className="font-display text-xl leading-snug">{insight.narrative}</p>
          {insight.expense_count > 0 && (
            <p className="text-[13px] text-[oklch(0.84_0.03_158)]">
              {formatMoney(insight.total_spent, insight.currency)} across {insight.expense_count}{" "}
              {insight.expense_count === 1 ? "expense" : "expenses"} in the last {insight.period_days} days
            </p>
          )}
        </>
      )}
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-white/25 px-4 text-[13px] transition-colors hover:bg-white/10"
      >
        <MessageCircle className="size-3.5" />
        Ask about this group
      </Link>
    </section>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 rounded-lg" />
      ))}
    </div>
  );
}

export function GroupDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <Skeleton className="h-4 w-24 rounded-full" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-2xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-3 w-40 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-16 rounded-[20px]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
