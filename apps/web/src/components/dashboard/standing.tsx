"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@settle/ui/components/dropdown-menu";
import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { buttonClass } from "@/components/dashboard/panel";
import { ExpenseSheet, type ExpenseSheetSeed } from "@/components/expenses/expense-sheet";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import {
  RecordSettlementDialog,
  type SettlementPreset,
} from "@/components/settlements/record-settlement-dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStanding } from "@/hooks/useStanding";
import { formatMoney, formatTotals, type PersonBalance, type Standing } from "@/lib/balances";
import { firstName, initials } from "@/lib/people";

// The top of the overview: one sentence for the net, then a two-column ledger
// with the people who owe the user facing the people the user owes. Rows are
// the api's simplified transfers summed per person (see computeStanding).

const VISIBLE_ROWS = 6;


const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/** Net per currency: what people pay the user minus what the user pays. */
function netByCurrency(standing: Standing) {
  const net = new Map(standing.owedTotals);
  for (const [currency, amount] of standing.oweTotals) net.set(currency, (net.get(currency) ?? 0) - amount);
  return net;
}

function Headline({ standing, groupCount }: { standing: Standing; groupCount: number }) {
  const net = netByCurrency(standing);
  const settled = standing.owedToMe.length === 0 && standing.iOwe.length === 0;
  const payments = standing.iOwe.reduce((n, row) => n + row.payments.length, 0);

  let sentence: React.ReactNode = "Here’s where you stand";
  if (settled) sentence = "You’re all settled up";
  else if (net.size === 1) {
    const [currency, amount] = [...net][0];
    if (Math.abs(amount) < 0.005) sentence = "You’re even overall";
    else
      sentence = (
        <>
          You’re{" "}
          <span className={amount > 0 ? "text-primary" : "text-destructive"}>
            {formatMoney(amount, currency)}
          </span>{" "}
          {amount > 0 ? "ahead" : "behind"}
        </>
      );
  }

  const parts: string[] = [];
  if (settled) parts.push(`Nothing to pay or collect across ${groupCount === 1 ? "your group" : `your ${groupCount} groups`}.`);
  else {
    const owedBy = standing.owedToMe.length;
    const owesTo = standing.iOwe.length;
    if (owedBy && owesTo) parts.push(`${people(owedBy)} owe${owedBy === 1 ? "s" : ""} you, you owe ${owesTo}.`);
    else if (owedBy) parts.push(`${people(owedBy)} owe${owedBy === 1 ? "s" : ""} you.`);
    else parts.push(`You owe ${people(owesTo)}.`);
    if (payments)
      parts.push(`${payments === 1 ? "One payment" : `${payments} payments`} would clear what you owe.`);
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-4xl leading-none tracking-tight text-balance md:text-5xl">{sentence}</h1>
      <p className="text-sm text-muted-foreground">{parts.join(" ")}</p>
    </div>
  );
}

function SettleUpButton({ row, meId, onRecord }: { row: PersonBalance; meId: string; onRecord: (p: SettlementPreset) => void }) {
  const preset = (groupId: string, amount: number) =>
    onRecord({ groupId, paidById: meId, receivedById: row.userId, amount });
  const className = buttonClass({ size: "sm" });

  if (row.payments.length === 1) {
    const [p] = row.payments;
    return (
      <button type="button" className={className} onClick={() => preset(p.groupId, p.amount)}>
        Settle up
      </button>
    );
  }
  // Settlements belong to a group, so a person spanning groups gets one payment per group.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        Settle up
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {row.payments.map((p) => (
          <DropdownMenuItem key={p.groupId} onClick={() => preset(p.groupId, p.amount)} className="justify-between text-sm">
            <span className="truncate">{p.groupName}</span>
            <span className="tabular-nums">{formatMoney(p.amount, row.currency)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function remind(row: PersonBalance) {
  const groups = row.payments.map((p) => p.groupName).join(" and ");
  const text = `Hi ${firstName(row.name) ?? "there"}, a quick reminder from Settle: ${formatMoney(row.amount, row.currency)} for ${groups}. Thanks!`;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return;
    } catch (error) {
      // The user closing the share sheet is not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Reminder copied", { description: "Paste it wherever you talk to them." });
  } catch {
    toast.error("Couldn’t copy the reminder");
  }
}

function LedgerColumn({
  side,
  rows,
  totals,
  currency,
  meId,
  onRecord,
  className,
}: {
  side: "owed" | "owe";
  rows: PersonBalance[];
  totals: Map<string, number>;
  currency: string;
  meId: string;
  onRecord: (p: SettlementPreset) => void;
  className?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const owed = side === "owed";
  const visible = showAll ? rows : rows.slice(0, VISIBLE_ROWS);
  const tone = owed ? "text-primary" : "text-destructive";

  return (
    <div className={cn("flex flex-col px-5 py-4 md:px-6 md:py-5", className)}>
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-sm font-semibold">{owed ? "Owed to you" : "You owe"}</h2>
        <span className={cn("font-display text-figure leading-none tabular-nums", rows.length ? tone : "text-muted-foreground")}>
          {formatTotals(totals, currency)}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          {owed ? "Nobody owes you right now." : "You don’t owe anyone right now."}
        </p>
      ) : (
        <ul className="flex flex-col">
          {visible.map((row) => (
            <li
              key={`${row.userId}:${row.currency}`}
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 border-b border-border/50 py-3 last:border-b-0"
            >
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-full bg-accent text-micro font-semibold text-primary"
              >
                {initials(row.name)}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{row.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {row.payments.map((p) => p.groupName).join(" · ")}
                </span>
              </div>
              <span className={cn("text-right text-sm font-semibold tabular-nums", tone)}>
                {formatMoney(row.amount, row.currency)}
              </span>
              <div className="flex justify-end">
                {owed ? (
                  <button
                    type="button"
                    onClick={() => remind(row)}
                    className={buttonClass({ variant: "secondary", size: "sm" })}
                  >
                    Remind
                  </button>
                ) : (
                  <SettleUpButton row={row} meId={meId} onRecord={onRecord} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows.length > VISIBLE_ROWS && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-2 self-start rounded-md text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {showAll ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}

function LedgerSkeleton() {
  return (
    <div aria-busy aria-label="Loading balances" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-11 w-80 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-full" />
      </div>
      <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
        {[0, 1].map((col) => (
          <div key={col} className={cn("flex flex-col gap-4 px-6 py-5", col === 1 && "border-t border-border md:border-t-0 md:border-l")}>
            <div className="flex justify-between border-b border-border pb-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3.5 w-1/3 rounded-full" />
                <Skeleton className="ml-auto h-3.5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StandingSection() {
  const { data: me } = useCurrentUser();
  const { standing, groups, currency, isLoading, isError, retry } = useStanding();
  const [settle, setSettle] = useState<SettlementPreset | null>(null);
  const [expense, setExpense] = useState<ExpenseSheetSeed | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setSettle({})}
        className={buttonClass({ variant: "secondary" })}
      >
        Record a payment
      </button>
      <button
        type="button"
        onClick={() => setExpense({ mode: "create" })}
        className={buttonClass()}
      >
        <Plus />
        Add expense
      </button>
    </div>
  );

  let body: React.ReactNode;
  if (isLoading) body = <LedgerSkeleton />;
  else if (isError || !standing || !me) {
    body = (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card px-6 py-5">
        <p className="text-sm font-medium">Couldn’t load your balances</p>
        <p className="text-sm text-muted-foreground">Your data is safe. Check your connection and try again.</p>
        <button type="button" onClick={retry} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Try again
        </button>
      </div>
    );
  } else if ((groups ?? []).length === 0) {
    body = (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Nothing to settle yet</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Start a group for your flat, a trip or date nights. Balances and who owes whom show up here as soon
              as someone adds an expense.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreatingGroup(true)}
            className={buttonClass()}
          >
            <Users />
            Start a group
          </button>
          <button
            type="button"
            onClick={() => setExpense({ mode: "create", groupId: null })}
            className={buttonClass({ variant: "secondary" })}
          >
            Add a personal expense
          </button>
        </div>
      </div>
    );
  } else {
    const settled = standing.owedToMe.length === 0 && standing.iOwe.length === 0;
    const net = netByCurrency(standing);
    const groupCount = groups?.length ?? 0;
    body = (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <Headline standing={standing} groupCount={groupCount} />
          {actions}
        </div>
        {settled ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-5">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-primary">
              <Check className="size-4" />
            </span>
            <p className="text-sm">
              Every balance is clear. New expenses will show up here with who owes what.
            </p>
          </div>
        ) : (
          <section aria-label="Balances" className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
            <LedgerColumn
              side="owed"
              rows={standing.owedToMe}
              totals={standing.owedTotals}
              currency={currency}
              meId={me.id}
              onRecord={setSettle}
              className="order-2 border-t border-border md:order-1 md:border-t-0"
            />
            <LedgerColumn
              side="owe"
              rows={standing.iOwe}
              totals={standing.oweTotals}
              currency={currency}
              meId={me.id}
              onRecord={setSettle}
              className="order-1 md:order-2 md:border-l md:border-border"
            />
            <div className="order-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-border bg-muted/50 px-5 py-3.5 md:col-span-2 md:px-6">
              <span className="text-xs text-muted-foreground">
                Net across {groupCount === 1 ? "1 group" : `${groupCount} groups`}
              </span>
              <span className="font-display text-2xl leading-none tabular-nums">
                {[...net].map(([c, amount], i) => (
                  <span key={c}>
                    {i > 0 && " + "}
                    <span className={amount > 0.005 ? "text-primary" : amount < -0.005 ? "text-destructive" : undefined}>
                      {formatMoney(amount, c, { signed: true })}
                    </span>
                  </span>
                ))}
              </span>
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      {body}
      <RecordSettlementDialog preset={settle} onOpenChange={(open) => !open && setSettle(null)} />
      <ExpenseSheet seed={expense} onOpenChange={(open) => !open && setExpense(null)} />
      <CreateGroupDialog open={creatingGroup} onOpenChange={setCreatingGroup} />
    </>
  );
}
