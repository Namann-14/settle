"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { CURRENCIES, Field, FormError, controlClass } from "@/components/forms/field";
import { useCreateIncome, useDeleteIncome, useUpdateIncome } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { num, todayIso } from "@/lib/people";
import type { Income } from "@/types";

export type IncomeSeed = { mode: "create" } | { mode: "edit"; income: Income };

export function IncomeDialog({
  seed,
  onOpenChange,
}: {
  /** null closes the dialog. */
  seed: IncomeSeed | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={seed !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-[440px]">
        {seed && (
          <IncomeForm
            key={seed.mode === "edit" ? seed.income.id : "create"}
            seed={seed}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function IncomeForm({ seed, onDone }: { seed: IncomeSeed; onDone: () => void }) {
  const { data: me } = useCurrentUser();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();
  const editing = seed.mode === "edit" ? seed.income : null;

  const [source, setSource] = useState(editing?.source ?? "");
  const [amount, setAmount] = useState(editing ? String(num(editing.amount)) : "");
  const [currency, setCurrency] = useState(editing?.currency ?? me?.default_currency ?? "INR");
  const [date, setDate] = useState(editing?.date ?? todayIso());
  const [error, setError] = useState<unknown>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const total = Number(amount);
    if (!(total > 0)) return setError(new Error("Enter an amount above zero"));
    const data = { source: source.trim(), amount: total.toFixed(2), currency, date };
    try {
      if (editing) await updateIncome.mutateAsync({ id: editing.id, data });
      else await createIncome.mutateAsync(data);
      toast.success(editing ? "Income updated" : "Income added");
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  const remove = async () => {
    if (!editing) return;
    try {
      await deleteIncome.mutateAsync(editing.id);
      toast.success("Income deleted");
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  const busy = createIncome.isPending || updateIncome.isPending || deleteIncome.isPending;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <DialogHeader className="gap-1.5">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {editing ? "Edit income" : "Add income"}
        </DialogTitle>
        <DialogDescription className="text-meta">
          Salary, freelance work, refunds. It counts toward what you saved this month.
        </DialogDescription>
      </DialogHeader>

      <Field label="Source">
        <input
          required
          maxLength={200}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Salary"
          className={controlClass}
        />
      </Field>
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3 sm:grid-cols-[minmax(0,1fr)_6rem_10rem]">
        <Field label="Amount">
          <input
            required
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0.00"
            className={controlClass}
          />
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={controlClass}>
            {[...new Set([currency, ...CURRENCIES])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Date" className="col-span-2 sm:col-span-1">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={controlClass} />
        </Field>
      </div>
      <FormError error={error} />

      <DialogFooter className="flex-row flex-wrap items-center gap-2">
        {editing && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className={buttonClass({ variant: "danger", className: "mr-auto" })}
          >
            <Trash2 />
            Delete
          </button>
        )}
        <button type="button" onClick={onDone} className={buttonClass({ variant: "secondary", className: "ml-auto" })}>
          Cancel
        </button>
        <button type="submit" disabled={busy || !source.trim()} className={buttonClass()}>
          {busy ? "Saving…" : editing ? "Save changes" : "Add income"}
        </button>
      </DialogFooter>
    </form>
  );
}
