"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@settle/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@settle/ui/components/sheet";
import { cn } from "@settle/ui/lib/utils";

import { CURRENCIES, Field, FormError, controlClass } from "@/components/forms/field";
import { useCreateExpense, useCreateRecurring, useDeleteExpense, useUpdateExpense } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroups } from "@/hooks/useGroups";
import { FREQUENCY_LABELS } from "@/lib/frequency";
import { num, todayIso } from "@/lib/people";
import type {
  CreateExpensePayload,
  CreateExpenseSplitPayload,
  Expense,
  ExpenseDraft,
  Frequency,
  GroupMember,
  SplitType,
} from "@/types";

export type ExpenseSheetSeed =
  | { mode: "create"; groupId?: string | null }
  | { mode: "draft"; draft: ExpenseDraft }
  | { mode: "edit"; expense: Expense };

const SPLIT_LABELS: Record<SplitType, string> = {
  EQUAL: "Equally",
  UNEQUAL: "Exact amounts",
  PERCENTAGE: "Percentages",
};

/** Split `total` into `n` cent-exact shares; the first share absorbs rounding. */
function equalShares(total: number, n: number) {
  if (n === 0) return [];
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / n);
  return Array.from({ length: n }, (_, i) => (base + (i === 0 ? cents - base * n : 0)) / 100);
}

interface Unresolved {
  rawName: string;
  candidates: string[];
  userId: string | "";
}

export function ExpenseSheet({
  seed,
  onOpenChange,
}: {
  seed: ExpenseSheetSeed | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={seed !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-[480px]">
        {seed && <ExpenseForm key={seedKey(seed)} seed={seed} onDone={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function seedKey(seed: ExpenseSheetSeed) {
  if (seed.mode === "edit") return `edit-${seed.expense.id}`;
  if (seed.mode === "draft") return `draft-${seed.draft.raw_text ?? seed.draft.description}`;
  return `create-${seed.groupId ?? "none"}`;
}

function ExpenseForm({ seed, onDone }: { seed: ExpenseSheetSeed; onDone: () => void }) {
  const { data: me } = useCurrentUser();
  const { data: groups } = useGroups();
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createRecurring = useCreateRecurring();

  const draft = seed.mode === "draft" ? seed.draft : null;
  const editing = seed.mode === "edit" ? seed.expense : null;

  const [description, setDescription] = useState(
    editing?.description ?? draft?.description ?? "",
  );
  const [amount, setAmount] = useState(
    editing ? String(num(editing.amount)) : draft?.amount != null ? String(draft.amount) : "",
  );
  const [date, setDate] = useState(editing?.date ?? draft?.date ?? todayIso());
  const [groupId, setGroupId] = useState<string>(
    editing?.group_id ?? draft?.group_id ?? (seed.mode === "create" ? seed.groupId ?? "" : ""),
  );
  const [categoryId, setCategoryId] = useState<string>(
    editing?.category_id ?? draft?.category?.category_id ?? "",
  );
  const [currencyOverride, setCurrencyOverride] = useState<string | null>(
    editing?.currency ?? (draft?.currency && draft.currency !== me?.default_currency ? draft.currency : null),
  );
  const [paidById, setPaidById] = useState<string>(editing?.paid_by_id ?? draft?.paid_by_id ?? "");
  const [splitType, setSplitType] = useState<SplitType>(
    editing?.split_type ?? draft?.split_type ?? "EQUAL",
  );
  // user_id -> included
  const [included, setIncluded] = useState<Set<string> | null>(
    editing ? new Set(editing.splits.map((s) => s.user_id)) : null,
  );
  // user_id -> typed value (amount for UNEQUAL, percent for PERCENTAGE)
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!editing) return {};
    const out: Record<string, string> = {};
    for (const s of editing.splits) {
      out[s.user_id] =
        editing.split_type === "PERCENTAGE" ? String(num(s.percentage)) : String(num(s.amount_owed));
    }
    return out;
  });
  const [unresolved, setUnresolved] = useState<Unresolved[]>(
    () =>
      draft?.participants
        .filter((p) => p.resolution === "unresolved" || p.resolution === "ambiguous")
        .map((p) => ({ rawName: p.raw_name, candidates: p.candidates, userId: "" })) ?? [],
  );
  // Personal expenses can repeat; "" means a one-off.
  const [repeats, setRepeats] = useState<Frequency | "">("");
  const [error, setError] = useState<unknown>(null);

  const group = groups?.find((g) => g.id === groupId);
  const members: GroupMember[] = useMemo(
    () => group?.members.filter((m) => !m.removed_at) ?? [],
    [group],
  );
  const currency = currencyOverride ?? group?.default_currency ?? me?.default_currency ?? "INR";

  // Default payer and participants once the group's members are known.
  useEffect(() => {
    if (!me) return;
    if (!paidById) setPaidById(me.id);
    if (included === null && (members.length > 0 || !groupId)) {
      if (draft) {
        const ids = new Set<string>([me.id]);
        for (const p of draft.participants) if (p.user_id) ids.add(p.user_id);
        setIncluded(ids);
      } else {
        setIncluded(new Set(groupId ? members.map((m) => m.user_id) : [me.id]));
      }
    }
  }, [me, members, groupId, draft, included, paidById]);

  const changeGroup = (next: string) => {
    setGroupId(next);
    setCurrencyOverride(null);
    const nextMembers = groups?.find((g) => g.id === next)?.members.filter((m) => !m.removed_at) ?? [];
    setIncluded(new Set(next ? nextMembers.map((m) => m.user_id) : me ? [me.id] : []));
    if (me) setPaidById(me.id);
    setUnresolved((u) => u.map((x) => ({ ...x, userId: "" })));
  };

  const participantIds = useMemo(() => {
    const ids = new Set(included ?? []);
    for (const u of unresolved) if (u.userId) ids.add(u.userId);
    // Only current group members can hold a split.
    if (groupId) for (const id of ids) if (!members.some((m) => m.user_id === id)) ids.delete(id);
    return [...ids];
  }, [included, unresolved, groupId, members]);

  const total = Number(amount) || 0;
  const shares = equalShares(total, participantIds.length);
  const typedSum = participantIds.reduce((sum, id) => sum + (Number(values[id]) || 0), 0);

  const people = groupId
    ? members
    : me
      ? [{ id: "me", user_id: me.id, user_name: me.name, user_email: me.email } as GroupMember]
      : [];
  const labelFor = (m: Pick<GroupMember, "user_id" | "user_name" | "user_email">) =>
    m.user_id === me?.id ? "You" : m.user_name || m.user_email || "Member";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!me) return;
    if (!(total > 0)) return setError(new Error("Enter an amount above zero"));
    if (participantIds.length === 0) return setError(new Error("Pick at least one person to split with"));
    if (unresolved.some((u) => !u.userId))
      return setError(new Error("Match or remove every name the AI couldn't place"));

    let splits: CreateExpenseSplitPayload[];
    if (splitType === "EQUAL") {
      splits = participantIds.map((id, i) => ({ user_id: id, amount_owed: shares[i].toFixed(2) }));
    } else if (splitType === "UNEQUAL") {
      if (Math.abs(typedSum - total) > 0.01)
        return setError(new Error(`Amounts add up to ${typedSum.toFixed(2)}, not ${total.toFixed(2)}`));
      splits = participantIds.map((id) => ({
        user_id: id,
        amount_owed: (Number(values[id]) || 0).toFixed(2),
      }));
    } else {
      if (Math.abs(typedSum - 100) > 0.01)
        return setError(new Error(`Percentages add up to ${typedSum}%, not 100%`));
      // Cent-exact: last person absorbs the rounding.
      let running = 0;
      splits = participantIds.map((id, i) => {
        const pct = Number(values[id]) || 0;
        const owed =
          i === participantIds.length - 1 ? total - running : Math.round(total * pct) / 100;
        running += owed;
        return { user_id: id, amount_owed: owed.toFixed(2), percentage: pct.toFixed(2) };
      });
    }

    const payload: CreateExpensePayload = {
      description: description.trim(),
      merchant: editing?.merchant ?? draft?.merchant ?? null,
      amount: total.toFixed(2),
      currency,
      date,
      split_type: splitType,
      group_id: groupId || null,
      category_id: categoryId || null,
      paid_by_id: paidById || me.id,
      splits,
    };

    try {
      if (repeats && !groupId && !editing) {
        // A repeating expense is a recurring rule; the sync logs this first
        // occurrence (and any past-dated ones) right away.
        const { created } = await createRecurring.mutateAsync({
          description: payload.description,
          amount: total.toFixed(2),
          currency,
          category_id: payload.category_id,
          frequency: repeats,
          start_date: date,
        });
        toast.success(
          created > 0 ? `Expense added · repeats ${FREQUENCY_LABELS[repeats].toLowerCase()}` : "Recurring expense scheduled",
        );
        onDone();
        return;
      }
      if (editing) {
        await updateExpense.mutateAsync({ id: editing.id, data: payload });
        toast.success("Expense updated");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Expense added");
      }
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  const remove = async () => {
    if (!editing) return;
    try {
      await deleteExpense.mutateAsync(editing.id);
      toast.success("Expense deleted");
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  const busy =
    createExpense.isPending || updateExpense.isPending || deleteExpense.isPending || createRecurring.isPending;
  const canEdit = !editing || editing.created_by_id === me?.id;

  return (
    <form onSubmit={submit} className="flex min-h-full flex-col">
      <SheetHeader className="gap-1.5 p-6 pb-2">
        {draft && (
          <span className="flex items-center gap-1.5 text-xs tracking-[0.08em] text-primary uppercase">
            <Sparkles className="size-3.5" />
            AI draft · {Math.round(draft.confidence * 100)}% confident
          </span>
        )}
        <SheetTitle className="font-display text-3xl font-normal">
          {editing ? "Edit expense" : draft ? "Review expense" : "Add expense"}
        </SheetTitle>
        {draft?.raw_text || draft?.transcript ? (
          <SheetDescription className="text-[13px]">
            “{draft.transcript ?? draft.raw_text}”
          </SheetDescription>
        ) : (
          <SheetDescription className="text-[13px]">
            {!groupId
              ? "Track a personal expense."
              : editing
                ? "Changes update everyone’s balances."
                : "Split a bill with your group."}
          </SheetDescription>
        )}
      </SheetHeader>

      <fieldset disabled={!canEdit} className="flex flex-1 flex-col gap-4 px-6 py-4">
        {draft && draft.warnings.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            {draft.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        <Field label="Description">
          <input
            required
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dinner at Toit"
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
            <select
              value={currency}
              onChange={(e) => setCurrencyOverride(e.target.value)}
              className={controlClass}
            >
              {[...new Set([currency, ...CURRENCIES])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" className="w-40">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={controlClass}
            />
          </Field>
        </div>
        <div className="flex gap-3">
          <Field label="Group" className="flex-1">
            <select value={groupId} onChange={(e) => changeGroup(e.target.value)} className={controlClass}>
              <option value="">No group (just me)</option>
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Category"
            className="flex-1"
            hint={
              draft?.category && !draft.category.category_id
                ? `AI suggested “${draft.category.category_name}”`
                : undefined
            }
          >
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

        {!groupId && !editing && (
          <Field
            label="Repeats"
            hint={repeats ? "Logged automatically each time it falls due. Manage it under Spending → Recurring." : undefined}
          >
            <select
              value={repeats}
              onChange={(e) => setRepeats(e.target.value as Frequency | "")}
              className={controlClass}
            >
              <option value="">Never</option>
              {(["WEEKLY", "MONTHLY", "YEARLY"] as const).map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>
        )}

        {groupId && (
          <div className="flex gap-3">
            <Field label="Paid by" className="flex-1">
              <select value={paidById} onChange={(e) => setPaidById(e.target.value)} className={controlClass}>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {labelFor(m)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Split" className="flex-1">
              <select
                value={splitType}
                onChange={(e) => setSplitType(e.target.value as SplitType)}
                className={controlClass}
              >
                {(Object.keys(SPLIT_LABELS) as SplitType[]).map((t) => (
                  <option key={t} value={t}>
                    {SPLIT_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {unresolved.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium">Who did you mean?</span>
            {unresolved.map((u, i) => (
              <div
                key={u.rawName}
                className="flex items-center gap-3 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm"
              >
                <span className="flex-1 truncate">
                  “{u.rawName}”
                  {u.candidates.length > 0 && (
                    <span className="text-xs text-muted-foreground"> · maybe {u.candidates.join(" or ")}</span>
                  )}
                </span>
                {groupId ? (
                  <select
                    aria-label={`Match ${u.rawName}`}
                    value={u.userId}
                    onChange={(e) =>
                      setUnresolved((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, userId: e.target.value } : x)),
                      )
                    }
                    className="h-8 rounded-lg border border-border bg-card px-2 text-[13px]"
                  >
                    <option value="">Pick member</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {labelFor(m)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-muted-foreground">Pick a group first</span>
                )}
                <button
                  type="button"
                  onClick={() => setUnresolved((prev) => prev.filter((_, j) => j !== i))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {groupId && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium">
              {splitType === "EQUAL" ? "Split equally between" : "Split between"}
            </span>
            <ul className="flex flex-col gap-1.5">
              {people.map((m) => {
                const on = participantIds.includes(m.user_id);
                const idx = participantIds.indexOf(m.user_id);
                return (
                  <li
                    key={m.user_id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      on ? "bg-muted" : "bg-transparent text-muted-foreground",
                    )}
                  >
                    <label className="flex flex-1 items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) =>
                          setIncluded((prev) => {
                            const next = new Set(prev ?? []);
                            if (e.target.checked) next.add(m.user_id);
                            else next.delete(m.user_id);
                            return next;
                          })
                        }
                        className="size-4 accent-[var(--primary)]"
                      />
                      <span className="truncate">
                        {labelFor(m)}
                        {m.user_id === paidById && <span className="text-muted-foreground"> · paid</span>}
                      </span>
                    </label>
                    {on && splitType === "EQUAL" && (
                      <span className="tabular-nums">{shares[idx]?.toFixed(2)}</span>
                    )}
                    {on && splitType !== "EQUAL" && (
                      <span className="flex items-center gap-1">
                        <input
                          aria-label={`${labelFor(m)} ${splitType === "PERCENTAGE" ? "percent" : "amount"}`}
                          inputMode="decimal"
                          value={values[m.user_id] ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [m.user_id]: e.target.value.replace(/[^\d.]/g, "") }))
                          }
                          className="h-8 w-24 rounded-lg border border-border bg-card px-2 text-right text-[13px] tabular-nums"
                        />
                        {splitType === "PERCENTAGE" && <span className="text-xs text-muted-foreground">%</span>}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {splitType !== "EQUAL" && (
              <span
                className={cn(
                  "text-right text-xs",
                  Math.abs(typedSum - (splitType === "PERCENTAGE" ? 100 : total)) > 0.01
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {splitType === "PERCENTAGE"
                  ? `${typedSum}% of 100%`
                  : `${typedSum.toFixed(2)} of ${total.toFixed(2)}`}
              </span>
            )}
          </div>
        )}

        {!canEdit && (
          <p className="text-[13px] text-muted-foreground">Only the person who added this expense can edit it.</p>
        )}
        <FormError error={error} />
      </fieldset>

      <SheetFooter className="flex-row items-center gap-2 border-t border-border/60 p-6">
        {editing && canEdit && (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto h-11 px-4 text-sm"
            onClick={remove}
            disabled={busy}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" className="ml-auto h-11 px-5 text-sm" onClick={onDone}>
          {draft ? "Discard" : "Cancel"}
        </Button>
        {canEdit && (
          <Button type="submit" className="h-11 px-6 text-sm" disabled={busy || !description.trim()}>
            {busy ? "Saving…" : editing ? "Save changes" : "Save expense"}
          </Button>
        )}
      </SheetFooter>
    </form>
  );
}
