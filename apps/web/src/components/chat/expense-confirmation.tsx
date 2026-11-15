"use client";

import { Button } from "@settle/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@settle/ui/components/item";
import { ReceiptText } from "lucide-react";

import type { ExpensePreview } from "@/lib/chat-types";

// Exact to the cent: this is what will be saved, so no rounding.
export function expenseAmount(e: ExpensePreview) {
  return Number(e.amount).toLocaleString(undefined, {
    style: "currency",
    currency: e.currency,
    maximumFractionDigits: 2,
  });
}

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

// "₹1,200 · Hong Kong Trip · split between You, Asha · you paid · 15 Nov · Food"
export function expenseSummary(e: ExpensePreview) {
  const people = e.splits.map((s) => s.name);
  return [
    expenseAmount(e),
    e.group,
    e.group ? `split between ${people.join(", ")}` : null,
    e.group ? (e.paid_by === "You" ? "you paid" : `${e.paid_by} paid`) : null,
    shortDate(e.date),
    e.category,
  ]
    .filter(Boolean)
    .join(" · ");
}

// The Confirmation pattern (shadcn AI Elements): an outline Item asking to
// approve the expense the assistant wants to add. Once answered, the tool
// call renders as an ordinary Tool line instead (see assistant-message.tsx).
export function ExpenseConfirmation({
  expense,
  disabled,
  onAnswer,
}: {
  expense: ExpensePreview;
  disabled?: boolean;
  onAnswer: (approved: boolean) => void;
}) {
  return (
    <Item variant="outline" size="sm" className="bg-card" role="group" aria-label="Add this expense?">
      <ItemMedia variant="icon">
        <ReceiptText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Add {expense.description}?</ItemTitle>
        <ItemDescription>{expenseSummary(expense)}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline" disabled={disabled} onClick={() => onAnswer(false)}>
          Deny
        </Button>
        <Button size="sm" disabled={disabled} onClick={() => onAnswer(true)}>
          Approve
        </Button>
      </ItemActions>
    </Item>
  );
}
