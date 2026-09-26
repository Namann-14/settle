"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@settle/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@settle/ui/components/dialog";

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
      <DialogContent className="gap-5 p-7 sm:max-w-[440px]">
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
        <DialogTitle className="font-display text-3xl font-normal">
          {editing ? "Edit income" : "Add income"}
        </DialogTitle>
        <DialogDescription className="text-[13px]">
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
      <div className="flex gap-3">
        <Field label="Amount" className="flex-1">
          <input
            required
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0.00"
            className={controlClass}
          />
        </Field>
        <Field label="Currency" className="w-24">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={controlClass}>
            {[...new Set([currency, ...CURRENCIES])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Date" className="w-40">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={controlClass} />
        </Field>
      </div>
      <FormError error={error} />

      <DialogFooter className="flex-row items-center gap-2">
        {editing && (
          <Button type="button" variant="destructive" className="mr-auto h-11 px-4 text-sm" onClick={remove} disabled={busy}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" className="ml-auto h-11 px-5 text-sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="h-11 px-6 text-sm" disabled={busy || !source.trim()}>
          {busy ? "Saving…" : editing ? "Save changes" : "Add income"}
        </Button>
      </DialogFooter>
    </form>
  );
}
