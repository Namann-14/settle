import { buildNameMap } from "@/lib/people";
import type { Expense, Group, GroupBalances, Settlement } from "@/types";

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

/** One payment from the api's simplified transfers, in one group. */
export interface GroupPayment {
  groupId: string;
  groupName: string;
  amount: number;
}

/** Everything one person pays the user (or the user pays them) in one currency. */
export interface PersonBalance {
  userId: string;
  name: string;
  currency: string;
  amount: number;
  payments: GroupPayment[];
}

export interface Standing {
  /** People who pay the user, largest first. */
  owedToMe: PersonBalance[];
  /** People the user pays, largest first. */
  iOwe: PersonBalance[];
  /** Totals per currency. */
  owedTotals: Map<string, number>;
  oweTotals: Map<string, number>;
  /** The user's net per group (positive: the group owes them), in the group's currency. */
  groupNet: Map<string, { net: number; currency: string }>;
}

// Unlike computeBalances, this works from the api's per-group balances, so the
// numbers cover every expense, not just the ones the page fetched. Rows are the
// simplified transfers (the fewest payments that clear each group) that involve
// the user, summed per person and currency across groups. That way "Settle up"
// always records a payment the api itself would ask for.
export function computeStanding(
  groups: Group[],
  balancesByGroup: Map<string, GroupBalances>,
  meId: string,
): Standing {
  const names = buildNameMap(groups);
  const incoming = new Map<string, PersonBalance>();
  const outgoing = new Map<string, PersonBalance>();
  const groupNet = new Map<string, { net: number; currency: string }>();

  const add = (bucket: Map<string, PersonBalance>, userId: string, currency: string, payment: GroupPayment) => {
    const key = `${userId}:${currency}`;
    const row = bucket.get(key) ?? {
      userId,
      name: names.get(userId) ?? "Member",
      currency,
      amount: 0,
      payments: [],
    };
    row.amount += payment.amount;
    row.payments.push(payment);
    bucket.set(key, row);
  };

  for (const group of groups) {
    const balances = balancesByGroup.get(group.id);
    if (!balances) continue;
    const mine = balances.members.find((m) => m.user_id === meId);
    groupNet.set(group.id, { net: Number(mine?.net ?? 0), currency: balances.currency });
    for (const t of balances.transfers) {
      const payment = { groupId: group.id, groupName: group.name, amount: Number(t.amount) };
      if (payment.amount < 0.005) continue;
      if (t.to_user_id === meId) add(incoming, t.from_user_id, balances.currency, payment);
      else if (t.from_user_id === meId) add(outgoing, t.to_user_id, balances.currency, payment);
    }
  }

  const sorted = (bucket: Map<string, PersonBalance>) =>
    [...bucket.values()].sort((a, b) => b.amount - a.amount);
  const totals = (rows: PersonBalance[]) => {
    const map = new Map<string, number>();
    for (const row of rows) map.set(row.currency, (map.get(row.currency) ?? 0) + row.amount);
    return map;
  };

  const owedToMe = sorted(incoming);
  const iOwe = sorted(outgoing);
  return { owedToMe, iOwe, owedTotals: totals(owedToMe), oweTotals: totals(iOwe), groupNet };
}

/** "₹7,760" or "₹7,760 + $20" when amounts span currencies. */
export function formatTotals(totals: Map<string, number>, fallbackCurrency: string) {
  if (totals.size === 0) return formatMoney(0, fallbackCurrency);
  return [...totals].map(([currency, amount]) => formatMoney(amount, currency)).join(" + ");
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
