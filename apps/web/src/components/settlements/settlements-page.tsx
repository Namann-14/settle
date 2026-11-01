"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  buttonClass,
  rowClass,
} from "@/components/dashboard/panel";
import {
  RecordSettlementDialog,
  type SettlementPreset,
} from "@/components/settlements/record-settlement-dialog";
import { SettlePlanCard } from "@/components/settlements/settle-plan-card";
import { useDeleteSettlement } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSettlements } from "@/hooks/useSettlements";
import { useStanding } from "@/hooks/useStanding";
import { formatMoney, formatTotals } from "@/lib/balances";
import { buildNameMap, displayName, formatDay, num } from "@/lib/people";
import type { Settlement } from "@/types";

const SETTLEMENT_PARAMS = { limit: 100 };

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

const selectClass =
  "h-11 max-w-44 truncate rounded-full border border-border bg-card px-3 text-xs text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:h-8";

function InlineError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <p className="py-3 text-sm text-muted-foreground">
      Couldn’t load {what}.{" "}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Try again
      </button>
    </p>
  );
}

function HistorySkeleton() {
  return (
    <div aria-busy aria-label="Loading payments" className="flex flex-col">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={rowClass}>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-36 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SettlementsPage() {
  const { data: me } = useCurrentUser();
  // What's left to settle comes from the api's per-group balances (the same
  // numbers as Overview), not from the latest 100 expenses on the client.
  const { standing, groups, currency, isLoading: standingLoading, isError: standingError, retry } = useStanding();
  const settlements = useSettlements(SETTLEMENT_PARAMS);
  const [preset, setPreset] = useState<SettlementPreset | null>(null);
  const [groupFilter, setGroupFilter] = useState("");

  const names = useMemo(() => buildNameMap(groups), [groups]);
  const groupName = useMemo(() => new Map(groups?.map((g) => [g.id, g.name])), [groups]);
  const groupCount = groups?.length ?? 0;

  const recent = useMemo(() => {
    if (!settlements.data) return null;
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const list = settlements.data.filter((s) => new Date(s.date) >= monthAgo);
    return { total: list.reduce((sum, s) => sum + num(s.amount), 0), count: list.length };
  }, [settlements.data]);

  const history = (settlements.data ?? []).filter((s) => !groupFilter || s.group_id === groupFilter);

  let figures: React.ReactNode;
  if (standingLoading || settlements.isLoading) figures = <FigureStripSkeleton count={3} />;
  else if (standingError || !standing || !recent)
    figures = (
      <InlineError
        what="your balances"
        onRetry={() => {
          retry();
          if (settlements.isError) settlements.refetch();
        }}
      />
    );
  else {
    const owedBy = standing.owedToMe.length;
    const owesTo = standing.iOwe.length;
    figures = (
      <FigureStrip
        className="animate-fade-in"
        figures={[
          {
            label: "Owed to you",
            value: formatTotals(standing.owedTotals, currency),
            hint: owedBy ? `From ${people(owedBy)}` : "Nobody owes you",
            money: true,
            tone: owedBy ? "positive" : "muted",
          },
          {
            label: "You owe",
            value: formatTotals(standing.oweTotals, currency),
            hint: owesTo ? `To ${people(owesTo)}` : "You don’t owe anyone",
            money: true,
            tone: owesTo ? "negative" : "muted",
          },
          {
            label: "Settled in the last 30 days",
            value: formatMoney(recent.total, currency),
            hint: `${recent.count} ${recent.count === 1 ? "payment" : "payments"} recorded`,
            money: true,
          },
        ]}
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settle up"
        description={
          groupCount
            ? `Who pays whom across your ${groupCount === 1 ? "group" : `${groupCount} groups`}, and every payment so far.`
            : "Join or start a group to settle up with people."
        }
        actions={
          <button
            type="button"
            onClick={() => setPreset({})}
            disabled={!groupCount}
            className={buttonClass()}
          >
            <Plus />
            Record a payment
          </button>
        }
      />

      {figures}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SettlePlanCard onRecord={setPreset} />

        <Panel className="gap-1">
          <PanelHeader
            title="Payment history"
            action={
              groupCount > 1 ? (
                <select
                  aria-label="Filter by group"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All groups</option>
                  {groups?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              ) : undefined
            }
          />
          {settlements.isLoading ? (
            <HistorySkeleton />
          ) : settlements.isError ? (
            <InlineError what="payments" onRetry={() => settlements.refetch()} />
          ) : history.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">
              {groupFilter
                ? "No payments in this group yet."
                : "No payments yet. Record one when someone pays you back, or you pay them."}
            </p>
          ) : (
            <ul className="flex animate-fade-in flex-col">
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
        </Panel>
      </div>

      <RecordSettlementDialog preset={preset} onOpenChange={(open) => !open && setPreset(null)} />
    </PageContainer>
  );
}

/** One recorded payment. Also used on the group detail page. */
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
    <li className={cn(rowClass, "gap-3")}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">
          {payer} paid {payee}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {[groupName, formatDay(s.date), s.note && `“${s.note}”`].filter(Boolean).join(" · ")}
        </span>
      </div>
      <span
        className={cn(
          "shrink-0 text-right font-semibold tabular-nums",
          incoming && "text-primary",
          outgoing && "text-muted-foreground",
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
          aria-label={`Remove payment: ${payer} paid ${payee}`}
          className={buttonClass({
            variant: "ghost",
            size: "sm",
            className: "-mr-2 w-11 px-0 hover:text-destructive sm:w-8",
          })}
        >
          <Trash2 />
        </button>
      )}
    </li>
  );
}
