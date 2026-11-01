"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@settle/ui/components/dialog";

import { buttonClass } from "@/components/dashboard/panel";
import { Field, FormError, controlClass } from "@/components/forms/field";
import { useCreateSettlement } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroups } from "@/hooks/useGroups";
import { todayIso } from "@/lib/people";

export interface SettlementPreset {
  groupId?: string | null;
  paidById?: string;
  receivedById?: string;
  amount?: number;
}

export function RecordSettlementDialog({
  preset,
  onOpenChange,
}: {
  /** null closes the dialog. */
  preset: SettlementPreset | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={preset !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        {preset && (
          <SettlementForm
            key={JSON.stringify(preset)}
            preset={preset}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SettlementForm({ preset, onDone }: { preset: SettlementPreset; onDone: () => void }) {
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const createSettlement = useCreateSettlement();

  const [groupId, setGroupId] = useState(preset.groupId ?? groups?.[0]?.id ?? "");
  const [paidById, setPaidById] = useState(preset.paidById ?? me?.id ?? "");
  const [receivedById, setReceivedById] = useState(preset.receivedById ?? "");
  const [amount, setAmount] = useState(preset.amount ? preset.amount.toFixed(2) : "");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [error, setError] = useState<unknown>(null);

  const group = groups?.find((g) => g.id === groupId);
  const members = useMemo(() => group?.members.filter((m) => !m.removed_at) ?? [], [group]);
  const label = (id: string) => {
    if (id === me?.id) return "You";
    const m = members.find((x) => x.user_id === id);
    return m?.user_name || m?.user_email || "Member";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!groupId) return setError(new Error("Pick a group"));
    if (!paidById || !receivedById) return setError(new Error("Pick who paid and who received"));
    if (paidById === receivedById) return setError(new Error("Payer and recipient must differ"));
    if (!(value > 0)) return setError(new Error("Enter an amount above zero"));
    try {
      await createSettlement.mutateAsync({
        amount: value.toFixed(2),
        currency: group?.default_currency ?? me?.default_currency ?? "INR",
        date,
        note: note.trim() || null,
        group_id: groupId,
        paid_by_id: paidById,
        received_by_id: receivedById,
      });
      toast.success(`Recorded: ${label(paidById)} paid ${label(receivedById)}`);
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <DialogHeader className="gap-1.5">
        <DialogTitle className="text-lg font-semibold tracking-tight">Record a payment</DialogTitle>
        <DialogDescription className="text-meta">
          Log money that changed hands outside Settle, like cash or UPI.
        </DialogDescription>
      </DialogHeader>

      <Field label="Group">
        <select
          value={groupId}
          onChange={(e) => {
            setGroupId(e.target.value);
            setReceivedById("");
          }}
          className={controlClass}
        >
          {groups?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
        <Field label="Who paid">
          <select value={paidById} onChange={(e) => setPaidById(e.target.value)} className={controlClass}>
            <option value="" disabled>
              Pick member
            </option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {label(m.user_id)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Paid to">
          <select value={receivedById} onChange={(e) => setReceivedById(e.target.value)} className={controlClass}>
            <option value="" disabled>
              Pick member
            </option>
            {members
              .filter((m) => m.user_id !== paidById)
              .map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {label(m.user_id)}
                </option>
              ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
        <Field label={`Amount (${group?.default_currency ?? "INR"})`}>
          <input
            required
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0.00"
            className={`${controlClass} tabular-nums`}
          />
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={controlClass} />
        </Field>
      </div>
      <Field label="Note (optional)">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="UPI" className={controlClass} />
      </Field>

      <FormError error={error} />

      <DialogFooter className="mt-1 gap-2">
        <button type="button" className={buttonClass({ variant: "secondary", className: "h-11 sm:h-9" })} onClick={onDone}>
          Cancel
        </button>
        <button
          type="submit"
          className={buttonClass({ className: "h-11 sm:h-9" })}
          disabled={createSettlement.isPending}
        >
          {createSettlement.isPending ? "Saving…" : "Record payment"}
        </button>
      </DialogFooter>
    </form>
  );
}
