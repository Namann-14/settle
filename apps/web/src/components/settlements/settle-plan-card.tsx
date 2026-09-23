"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import type { SettlementPreset } from "@/components/settlements/record-settlement-dialog";
import { useSettlePlan } from "@/hooks/useAi";
import { formatMoney } from "@/lib/balances";
import { firstName, initials } from "@/lib/people";
import type { PlannedTransfer } from "@/types";

function title(t: PlannedTransfer) {
  const amount = formatMoney(t.amount, t.currency);
  if (t.direction === "incoming") return `${firstName(t.from_name) ?? "Someone"} pays you ${amount}`;
  if (t.direction === "outgoing") return `You pay ${firstName(t.to_name) ?? "someone"} ${amount}`;
  return `${firstName(t.from_name) ?? "Someone"} pays ${firstName(t.to_name) ?? "someone"} ${amount}`;
}

// Dark "AI" surface from the design. Transfers are computed by the api; the
// model only writes the headline and reminder copy.
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
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-[oklch(0.32_0.045_162)] p-6 text-[oklch(0.95_0.012_160)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs tracking-[0.08em] text-[oklch(0.8_0.04_158)] uppercase">
          <Sparkles className="size-3.5" />
          Settle AI · {groupId ? "settle this group" : "your settle-up plan"}
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 px-3 text-xs transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3", isFetching && "animate-spin")} />
          Regenerate
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-7 w-4/5 rounded-lg bg-white/10" />
          <Skeleton className="h-16 rounded-xl bg-white/10" />
          <Skeleton className="h-16 rounded-xl bg-white/10" />
        </div>
      ) : isError || !plan ? (
        <p className="text-sm text-[oklch(0.85_0.03_158)]">
          The settle-up plan isn’t available right now. Balances on this page are still accurate.
        </p>
      ) : (
        <>
          <p className="font-display text-2xl leading-tight md:text-[26px]">{plan.headline}</p>
          {plan.transfers.length > 0 && (
            <ul className="flex flex-col gap-2.5">
              {plan.transfers.map((t) => {
                const other = t.direction === "incoming" ? t.from_name : t.to_name;
                return (
                  <li key={`${t.group_id}-${t.from_user_id}-${t.to_user_id}`} className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white/[0.07] p-3.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.75_0.05_158)] text-xs font-medium text-[oklch(0.25_0.02_160)]">
                        {initials(other)}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium">{title(t)}</span>
                        {!groupId && t.group_name && (
                          <span className="text-xs text-[oklch(0.82_0.03_158)]">{t.group_name}</span>
                        )}
                      </div>
                      {t.reminder && (
                        <button
                          type="button"
                          onClick={() => setOpenReminder(openReminder === t.index ? null : t.index)}
                          aria-expanded={openReminder === t.index}
                          className="h-9 rounded-full border border-white/25 px-3 text-xs transition-colors hover:bg-white/10"
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
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[oklch(0.95_0.012_160)] px-3.5 text-xs font-medium text-[oklch(0.3_0.04_162)] transition-opacity hover:opacity-90"
                      >
                        <Check className="size-3.5" />
                        {t.direction === "outgoing" ? "Record payment" : "Mark paid"}
                      </button>
                    </div>
                    {openReminder === t.index && t.reminder && (
                      <div className="flex items-start gap-3 rounded-xl border border-dashed border-white/25 p-3.5 text-[13px] leading-relaxed text-[oklch(0.88_0.02_160)]">
                        <p className="flex-1">{t.reminder}</p>
                        <button
                          type="button"
                          onClick={() => copy(t.reminder!)}
                          aria-label="Copy reminder"
                          className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
