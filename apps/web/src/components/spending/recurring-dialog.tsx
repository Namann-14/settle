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
import { useCreateRecurring, useDeleteRecurring, useUpdateRecurring } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { num, todayIso } from "@/lib/people";
import { FREQUENCY_LABELS } from "@/lib/frequency";
import type { Frequency, RecurringExpense } from "@/types";

export type RecurringSeed = { mode: "create" } | { mode: "edit"; rule: RecurringExpense };

export function RecurringDialog({
  seed,
  onOpenChange,
}: {
  seed: RecurringSeed | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={seed !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-7 sm:max-w-[460px]">
        {seed && (
          <RecurringForm
            key={seed.mode === "edit" ? seed.rule.id : "create"}
            seed={seed}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecurringForm({ seed, onDone }: { seed: RecurringSeed; onDone: () => void }) {
  const { data: me } = useCurrentUser();
  const { data: categories } = useCategories();
  const createRule = useCreateRecurring();
  const updateRule = useUpdateRecurring();
  const deleteRule = useDeleteRecurring();
  const editing = seed.mode === "edit" ? seed.rule : null;

  const [description, setDescription] = useState(editing?.description ?? "");
  const [amount, setAmount] = useState(editing ? String(num(editing.amount)) : "");
  const [currency, setCurrency] = useState(editing?.currency ?? me?.default_currency ?? "INR");
  const [categoryId, setCategoryId] = useState(editing?.category_id ?? "");
  const [frequency, setFrequency] = useState<Frequency>(editing?.frequency ?? "MONTHLY");
  const [every, setEvery] = useState(String(editing?.interval ?? 1));
  const [startDate, setStartDate] = useState(editing?.start_date ?? todayIso());
  const [endDate, setEndDate] = useState(editing?.end_date ?? "");
  const [error, setError] = useState<unknown>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const total = Number(amount);
    if (!(total > 0)) return setError(new Error("Enter an amount above zero"));
    const base = {
      description: description.trim(),
      amount: total.toFixed(2),
      currency,
      category_id: categoryId || null,
      frequency,
      interval: Math.max(1, Number(every) || 1),
      end_date: endDate || null,
    };
    try {
      if (editing) {
        await updateRule.mutateAsync({ id: editing.id, data: base });
        toast.success("Recurring expense updated");
      } else {
        const { created } = await createRule.mutateAsync({ ...base, start_date: startDate });
        toast.success(created > 0 ? `Recurring expense added · ${created} logged so far` : "Recurring expense added");
      }
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  const remove = async () => {
    if (!editing) return;
    try {
      await deleteRule.mutateAsync(editing.id);
      toast.success("Recurring expense deleted. Past entries are kept.");
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  const busy = createRule.isPending || updateRule.isPending || deleteRule.isPending;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <DialogHeader className="gap-1.5">
        <DialogTitle className="font-display text-3xl font-normal">
          {editing ? "Edit recurring" : "New recurring expense"}
        </DialogTitle>
        <DialogDescription className="text-[13px]">
          Rent, subscriptions, bills. Each one is logged automatically when it falls due.
        </DialogDescription>
      </DialogHeader>

      <Field label="Description">
        <input
          required
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Netflix"
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
        <Field label="Category" className="flex-1">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={controlClass}>
            <option value="">Uncategorized</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex gap-3">
        <Field label="Repeats" className="flex-1">
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className={controlClass}>
            {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Every" className="w-24">
          <input
            inputMode="numeric"
            value={every}
            onChange={(e) => setEvery(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className={controlClass}
          />
        </Field>
      </div>
      <div className="flex gap-3">
        <Field
          label="Starts"
          className="flex-1"
          hint={editing ? "Fixed once created" : "Past dates back-fill missed entries"}
        >
          <input
            type="date"
            required
            disabled={!!editing}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={controlClass}
          />
        </Field>
        <Field label="Ends" className="flex-1" hint="Optional">
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={controlClass}
          />
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
        <Button type="submit" className="h-11 px-6 text-sm" disabled={busy || !description.trim()}>
          {busy ? "Saving…" : editing ? "Save changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
