"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Panel, PanelHeader, buttonClass, rowClass } from "@/components/dashboard/panel";
import type { SettlementPreset } from "@/components/settlements/record-settlement-dialog";
import { useSettlePlan } from "@/hooks/useAi";
import { formatMoney } from "@/lib/balances";
import { firstName, initials } from "@/lib/people";
import type { PlannedTransfer } from "@/types";

function title(t: PlannedTransfer) {
  if (t.direction === "incoming") return `${firstName(t.from_name) ?? "Someone"} pays you`;
  if (t.direction === "outgoing") return `You pay ${firstName(t.to_name) ?? "someone"}`;
  return `${firstName(t.from_name) ?? "Someone"} pays ${firstName(t.to_name) ?? "someone"}`;
}

function PlanSkeleton() {
  return (
    <div aria-busy aria-label="Loading the settle-up plan" className="flex flex-col">
      <Skeleton className="mb-2 h-4 w-3/4 rounded-full" />
      {[0, 1, 2].map((i) => (
        <div key={i} className={rowClass}>
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3.5 w-32 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Settle AI's suggested payments, on the same surface as every other panel.
// Transfers are computed by the api; the model only writes the headline and
// the reminder copy.
export function SettlePlanCard({
  groupId,
  onRecord,
  className,
}: {
  groupId?: string;
  onRecord: (preset: SettlementPreset) => void;
  className?: string;
}) {
  const { data: plan, isLoading, isError, refetch, isFetching } = useSettlePlan(groupId);
  const [openReminder, setOpenReminder] = useState<number | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Reminder copied");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <Panel className={cn("gap-3", className)}>
      <PanelHeader
        title="Settle AI"
        description={groupId ? "The fewest payments that settle this group." : "The fewest payments that settle your groups."}
        action={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={buttonClass({ variant: "ghost", size: "sm" })}
          >
            {isFetching && !isLoading ? "Regenerating…" : "Regenerate"}
          </button>
        }
      />

      {isLoading ? (
        <PlanSkeleton />
      ) : isError || !plan ? (
        <div className="flex flex-col items-start gap-3 py-2">
          <p className="text-sm text-muted-foreground">
            The plan isn’t available right now. The balances on this page are still accurate.
          </p>
          <button type="button" onClick={() => refetch()} className={buttonClass({ variant: "secondary", size: "sm" })}>
            Try again
          </button>
        </div>
      ) : (
        <div className="flex animate-fade-in flex-col">
          <p className="text-sm text-foreground">{plan.headline}</p>
          {plan.transfers.length > 0 && (
            <ul className="mt-2 flex flex-col">
              {plan.transfers.map((t) => {
                const other = t.direction === "incoming" ? t.from_name : t.to_name;
                const reminderOpen = openReminder === t.index && !!t.reminder;
                return (
                  <li
                    key={`${t.group_id}-${t.from_user_id}-${t.to_user_id}`}
                    className="flex flex-col gap-2 border-b border-border/50 py-3 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-micro font-semibold text-primary"
                      >
                        {initials(other)}
                      </span>
                      <div className="flex min-w-0 flex-1 basis-40 flex-col">
                        <span className="truncate text-sm font-medium">{title(t)}</span>
                        {!groupId && t.group_name && (
                          <span className="truncate text-xs text-muted-foreground">{t.group_name}</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          t.direction === "incoming" && "text-primary",
                          t.direction === "outgoing" && "text-destructive",
                        )}
                      >
                        {formatMoney(t.amount, t.currency)}
                      </span>
                      <div className="flex w-full justify-end gap-2 sm:w-auto">
                        {t.reminder && (
                          <button
                            type="button"
                            onClick={() => setOpenReminder(openReminder === t.index ? null : t.index)}
                            aria-expanded={reminderOpen}
                            className={buttonClass({ variant: "secondary", size: "sm" })}
                          >
                            Reminder
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onRecord({
                              groupId: t.group_id,
                              paidById: t.from_user_id,
                              receivedById: t.to_user_id,
                              amount: t.amount,
                            })
                          }
                          className={buttonClass({ size: "sm" })}
                        >
                          {t.direction === "outgoing" ? "Record payment" : "Mark paid"}
                        </button>
                      </div>
                    </div>
                    {reminderOpen && (
                      <div className="flex animate-fade-in items-start gap-3 rounded-lg bg-muted px-3 py-2.5 text-meta leading-relaxed sm:ml-11">
                        <p className="flex-1">{t.reminder}</p>
                        <button
                          type="button"
                          onClick={() => copy(t.reminder!)}
                          aria-label="Copy reminder"
                          className={buttonClass({ variant: "ghost", size: "sm", className: "w-11 px-0 sm:w-8" })}
                        >
                          <Copy />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );
}
