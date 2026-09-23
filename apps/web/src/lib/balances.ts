import type { Expense, Settlement } from "@/types";

export interface Balances {
  /** Total others owe the current user. */
  owed: number;
  /** Total the current user owes others. */
  owe: number;
  /** owed - owe; positive means the user is ahead. */
  net: number;
  /** Number of people with a positive balance towards the user. */
  owedByCount: number;
  /** Number of people the user owes. */
  owesToCount: number;
  /** Net balance per group id ("none" for expenses outside a group). */
  byGroup: Map<string, number>;
}

// Balances are derived client-side from the expense splits and settlements the
// dashboard already fetches. Amounts in different currencies are summed as-is,
// the same simplification the other overview cards make.
export function computeBalances(
  expenses: Expense[],
  settlements: Settlement[],
  meId: string,
): Balances {
  // Positive: that person owes me. Negative: I owe them.
  const perPerson = new Map<string, number>();
  const byGroup = new Map<string, number>();
  const add = (userId: string, groupId: string | null | undefined, amount: number) => {
    perPerson.set(userId, (perPerson.get(userId) ?? 0) + amount);
    const key = groupId ?? "none";
    byGroup.set(key, (byGroup.get(key) ?? 0) + amount);
  };

  for (const expense of expenses) {
    if (expense.deleted_at) continue;
    for (const split of expense.splits) {
      const owed = Number(split.amount_owed);
      if (expense.paid_by_id === meId && split.user_id !== meId) {
        add(split.user_id, expense.group_id, owed);
      } else if (expense.paid_by_id !== meId && split.user_id === meId) {
        add(expense.paid_by_id, expense.group_id, -owed);
      }
    }
  }

  for (const s of settlements) {
    const amount = Number(s.amount);
    // Paying someone clears what I owe them; being paid clears what they owe me.
    if (s.paid_by_id === meId) add(s.received_by_id, s.group_id, amount);
    else if (s.received_by_id === meId) add(s.paid_by_id, s.group_id, -amount);
  }

  let owed = 0;
  let owe = 0;
  let owedByCount = 0;
  let owesToCount = 0;
  for (const value of perPerson.values()) {
    if (value > 0.005) {
      owed += value;
      owedByCount++;
    } else if (value < -0.005) {
      owe -= value;
      owesToCount++;
    }
  }

  return { owed, owe, net: owed - owe, owedByCount, owesToCount, byGroup };
}

/** The current user's share of expenses dated within the last `days` days. */
export function myShareSince(expenses: Expense[], meId: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  let total = 0;
  for (const expense of expenses) {
    if (expense.deleted_at || new Date(expense.date) < cutoff) continue;
    const mine = expense.splits.find((s) => s.user_id === meId);
    if (mine) total += Number(mine.amount_owed);
  }
  return total;
}

export function formatMoney(amount: number, currency: string, opts?: { signed?: boolean }) {
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (!opts?.signed || Math.abs(amount) < 0.005) return formatted;
  return `${amount > 0 ? "+" : "−"}${formatted}`;
}
