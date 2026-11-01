"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, Mail, UserMinus, X } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import {
  FigureStrip,
  FigureStripSkeleton,
  PageContainer,
  PageHeader,
  Panel,
  PanelHeader,
  Segmented,
  buttonClass,
  rowClass,
  type Figure,
} from "@/components/dashboard/panel";
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
import { JoinLinkCard } from "@/components/groups/join-link-card";
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
const TABS: { id: Tab; label: string }[] = [
  { id: "expenses", label: "Expenses" },
  { id: "settlements", label: "Settlements" },
  { id: "members", label: "Members" },
];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const linkButton =
  "rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50";

function Retry({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <p className="py-3 text-sm text-muted-foreground">
      Couldn’t load {what}.{" "}
      <button type="button" onClick={onRetry} className={linkButton}>
        Try again
      </button>
    </p>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard/groups"
      className="-mb-4 inline-flex h-8 items-center gap-1 self-start rounded-md text-meta text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <ChevronLeft className="size-3.5" />
      All groups
    </Link>
  );
}

export function GroupDetail({ groupId }: { groupId: string }) {
  const { data: group, isLoading, isError, error, refetch } = useGroup(groupId);
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("expenses");
  const [seed, setSeed] = useState<ExpenseSheetSeed | null>(null);
  const [preset, setPreset] = useState<SettlementPreset | null>(null);

  if (isLoading) return <GroupDetailSkeleton />;
  if (isError || !group) {
    return (
      <PageContainer narrow>
        <BackLink />
        <Panel className="items-start">
          <PanelHeader
            title="Group not found"
            description={error instanceof Error ? error.message : "It may have been deleted, or you’re not a member."}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => refetch()} className={buttonClass({ variant: "secondary", size: "sm" })}>
              Try again
            </button>
            <Link href="/dashboard/groups" className={buttonClass({ variant: "ghost", size: "sm" })}>
              Back to groups
            </Link>
          </div>
        </Panel>
      </PageContainer>
    );
  }

  const active = group.members.filter((m) => !m.removed_at);
  const isAdmin = active.some((m) => m.user_id === me?.id && m.role === "ADMIN");

  return (
    <PageContainer>
      <BackLink />
      <PageHeader
        title={group.name}
        description={[plural(active.length, "member"), group.default_currency, group.description]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <>
            <button
              type="button"
              onClick={() => setPreset({ groupId: group.id })}
              className={buttonClass({ variant: "secondary" })}
            >
              Settle up
            </button>
            <button
              type="button"
              onClick={() => setSeed({ mode: "create", groupId: group.id })}
              className={buttonClass()}
            >
              Add expense
            </button>
          </>
        }
      />

      <GroupFigures group={group} meId={me?.id} />

      <AiQuickAdd groupId={group.id} onDraft={(draft) => setSeed({ mode: "draft", draft })} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <Segmented options={TABS} value={tab} onChange={setTab} label="Show" className="self-start" />
          {tab === "expenses" && (
            <GroupExpenses group={group} meId={me?.id} onOpen={(e) => setSeed({ mode: "edit", expense: e })} />
          )}
          {tab === "settlements" && <GroupSettlements group={group} meId={me?.id} />}
          {tab === "members" && <GroupMembers group={group} meId={me?.id} isAdmin={isAdmin} />}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <BalancesPanel group={group} meId={me?.id} />
          <SettlePlanCard groupId={group.id} onRecord={setPreset} />
          <GroupInsightPanel groupId={group.id} />
        </div>
      </div>

      <ExpenseSheet seed={seed} onOpenChange={(open) => !open && setSeed(null)} />
      <RecordSettlementDialog preset={preset} onOpenChange={(open) => !open && setPreset(null)} />
    </PageContainer>
  );
}

/** The user's balance here and how many payments would clear the group. */
function GroupFigures({ group, meId }: { group: Group; meId?: string }) {
  const { data: balances, isLoading, isError, refetch } = useGroupBalances(group.id);

  if (isLoading) return <FigureStripSkeleton count={3} />;
  if (isError || !balances) return <Retry what="this group’s balances" onRetry={() => refetch()} />;

  const mine = num(balances.members.find((m) => m.user_id === meId)?.net);
  const payments = balances.transfers.length;
  const members = group.members.filter((m) => !m.removed_at).length;
  const figures: Figure[] = [
    {
      label: "Your balance",
      value: Math.abs(mine) < 0.005 ? "Settled" : formatMoney(mine, balances.currency, { signed: true }),
      hint: mine > 0.005 ? "The group owes you" : mine < -0.005 ? "You owe the group" : "Nothing to pay or collect",
      money: true,
      tone: mine > 0.005 ? "positive" : mine < -0.005 ? "negative" : "muted",
    },
    {
      label: "Payments to settle up",
      value: payments,
      hint: payments === 0 ? "Everyone’s square" : "The fewest that clear the group",
    },
    {
      label: "Members",
      value: members,
      hint: `Shared in ${balances.currency}`,
    },
  ];
  return <FigureStrip figures={figures} className="animate-fade-in" />;
}

function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy className="flex flex-col">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={rowClass}>
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5 rounded-full" />
            <Skeleton className="h-3 w-1/4 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
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
  const { data: expenses, isLoading, isError, refetch } = useExpenses({ group_id: group.id, limit: 100 });
  const { data: categories } = useCategories();
  const names = useMemo(() => buildNameMap([group]), [group]);
  const categoryName = useMemo(() => new Map(categories?.map((c) => [c.id, c.name])), [categories]);

  let body: React.ReactNode;
  if (isLoading) body = <RowsSkeleton />;
  else if (isError) body = <Retry what="expenses" onRetry={() => refetch()} />;
  else if (!expenses?.length) {
    body = (
      <p className="py-3 text-sm text-muted-foreground">
        No expenses yet. Describe one above, or use Add expense.
      </p>
    );
  } else {
    body = (
      <ul className="flex animate-fade-in flex-col">
        {expenses.map((e) => {
          const impact = myImpact(e, meId);
          return (
            <li key={e.id} className="border-b border-border/50 last:border-b-0">
              <button
                type="button"
                onClick={() => onOpen(e)}
                className={cn(
                  rowClass,
                  "-mx-2 w-[calc(100%+1rem)] rounded-lg border-b-0 px-2 text-left outline-none transition-colors duration-150 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{e.description}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayName(names, e.paid_by_id, meId)} paid ·{" "}
                    {(e.category_id && categoryName.get(e.category_id)) || "Uncategorized"} · {formatDay(e.date)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-medium tabular-nums">{formatMoney(num(e.amount), e.currency)}</span>
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

  return (
    <Panel className="gap-1">
      <PanelHeader title="Expenses" description={expenses?.length ? plural(expenses.length, "expense") : undefined} />
      {body}
    </Panel>
  );
}

function GroupSettlements({ group, meId }: { group: Group; meId?: string }) {
  const { data: settlements, isLoading, isError, refetch } = useSettlements({ group_id: group.id, limit: 100 });
  const names = useMemo(() => buildNameMap([group]), [group]);

  let body: React.ReactNode;
  if (isLoading) body = <RowsSkeleton />;
  else if (isError) body = <Retry what="settlements" onRetry={() => refetch()} />;
  else if (!settlements?.length) {
    body = <p className="py-3 text-sm text-muted-foreground">No payments yet. Use Settle up to record one.</p>;
  } else {
    body = (
      <ul className="flex animate-fade-in flex-col">
        {settlements.map((s) => (
          <SettlementRow key={s.id} settlement={s} meId={meId} names={names} />
        ))}
      </ul>
    );
  }

  return (
    <Panel className="gap-1">
      <PanelHeader title="Settlements" description="Payments recorded between members" />
      {body}
    </Panel>
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
      await invite.mutateAsync({ email: email.trim() });
      toast.success("Invite sent. They join once they accept it");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't invite that person");
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
    <Panel>
      <PanelHeader title="Members" description={plural(active.length, "member")} />

      <form onSubmit={submit} className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Email to invite</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Invite someone by email"
            className={controlClass}
          />
        </label>
        <button type="submit" disabled={invite.isPending} className={buttonClass()}>
          {invite.isPending ? "Inviting…" : "Invite"}
        </button>
      </form>

      <JoinLinkCard groupId={group.id} groupName={group.name} isAdmin={isAdmin} />

      <ul className="flex flex-col">
        {active.map((m) => {
          const self = m.user_id === meId;
          return (
            <li key={m.id} className={rowClass}>
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-micro font-semibold text-primary"
                >
                  {initials(m.user_name ?? m.user_email)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {self ? "You" : m.user_name || m.user_email || "Member"}
                    {m.role === "ADMIN" && <span className="font-normal text-muted-foreground"> · Admin</span>}
                  </span>
                  {m.user_email && <span className="truncate text-xs text-muted-foreground">{m.user_email}</span>}
                </span>
              </span>
              {(isAdmin || self) && (
                <button
                  type="button"
                  onClick={() => removeMember(m.id, self)}
                  disabled={remove.isPending}
                  className={buttonClass({
                    variant: "ghost",
                    size: "sm",
                    className: "hover:bg-destructive/10 hover:text-destructive",
                  })}
                >
                  <UserMinus />
                  {self ? "Leave" : "Remove"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {invitations && invitations.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <h3 className="text-meta font-medium">Pending invites</h3>
          <ul className="flex flex-col">
            {invitations.map((inv) => (
              <li key={inv.id} className={rowClass}>
                <span className="flex min-w-0 items-center gap-3">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{inv.email}</span>
                    <span className="text-xs text-muted-foreground">Waiting to accept</span>
                  </span>
                </span>
                {(isAdmin || inv.invited_by_id === meId) && (
                  <button
                    type="button"
                    onClick={() =>
                      cancel.mutate(inv.id, {
                        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't cancel the invite"),
                      })
                    }
                    aria-label={`Cancel invite for ${inv.email}`}
                    className={buttonClass({ variant: "ghost", size: "sm" })}
                  >
                    <X />
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function BalancesPanel({ group, meId }: { group: Group; meId?: string }) {
  const { data: balances, isLoading, isError, refetch } = useGroupBalances(group.id);
  const label = (userId: string) => {
    if (userId === meId) return "You";
    const m = balances?.members.find((x) => x.user_id === userId);
    return m?.user_name || m?.user_email || "Member";
  };

  return (
    <Panel className="gap-1">
      <PanelHeader title="Balances" description="Each member’s net position" />
      {isLoading ? (
        <RowsSkeleton rows={3} />
      ) : isError || !balances ? (
        <Retry what="balances" onRetry={() => refetch()} />
      ) : (
        <div className="flex animate-fade-in flex-col">
          <ul className="flex flex-col">
            {balances.members.map((m) => {
              const net = num(m.net);
              return (
                <li key={m.user_id} className={rowClass}>
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-micro font-semibold text-primary"
                    >
                      {initials(m.user_name ?? m.user_email)}
                    </span>
                    <span className="truncate">{label(m.user_id)}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-medium tabular-nums",
                      net > 0.005 ? "text-primary" : net < -0.005 ? "text-destructive" : "font-normal text-muted-foreground",
                    )}
                  >
                    {Math.abs(net) < 0.005 ? "Settled" : formatMoney(net, balances.currency, { signed: true })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function GroupInsightPanel({ groupId }: { groupId: string }) {
  const { data: insight, isLoading, isError, refetch } = useGroupInsight(groupId);

  return (
    <Panel className="gap-3">
      <PanelHeader
        title="Group insight"
        description="From Settle AI"
        action={
          <Link
            href="/dashboard"
            className="shrink-0 rounded-md text-xs text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Ask about this group
          </Link>
        }
      />
      {isLoading ? (
        <div aria-busy className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full rounded-full" />
          <Skeleton className="h-3.5 w-4/5 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
      ) : isError || !insight ? (
        <p className="text-sm text-muted-foreground">
          Insights aren’t available right now.{" "}
          <button type="button" onClick={() => refetch()} className={linkButton}>
            Try again
          </button>
        </p>
      ) : (
        <div className="flex animate-fade-in flex-col gap-1.5">
          <p className="text-sm leading-relaxed">{insight.narrative}</p>
          {insight.expense_count > 0 && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatMoney(insight.total_spent, insight.currency)} across {plural(insight.expense_count, "expense")} in
              the last {insight.period_days} days
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

export function GroupDetailSkeleton() {
  return (
    <PageContainer aria-busy aria-label="Loading group">
      <Skeleton className="-mb-4 h-4 w-20 rounded-full" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-72 max-w-full rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
      <FigureStripSkeleton count={3} />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="h-9 w-64 rounded-full" />
          <div className="rounded-2xl border border-border bg-card px-5 py-4 md:px-6">
            <RowsSkeleton rows={5} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4 md:px-6">
          <RowsSkeleton rows={3} />
        </div>
      </div>
    </PageContainer>
  );
}
