"use client";

import { useMemo } from "react";
import { Receipt } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@settle/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@settle/ui/components/table";

import { TableRowsSkeleton } from "@/components/dashboard/overview-skeleton";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";

const HEAD = "h-9 px-0 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground";

export function TransactionHistoryCard() {
  const { data: expenses, isLoading, isError } = useExpenses({ limit: 100 });
  const { data: categories } = useCategories();

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories ?? []) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const recent = useMemo(
    () =>
      [...(expenses ?? [])]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 8),
    [expenses],
  );

  return (
    <Panel className="h-full">
      <PanelHeader title="Recent activity" description="Your latest expenses" />
      {isLoading ? (
        <TableRowsSkeleton />
      ) : isError ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load expenses</EmptyTitle>
          <EmptyDescription>Try refreshing the page.</EmptyDescription>
        </Empty>
      ) : recent.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>No expenses yet</EmptyTitle>
          <EmptyDescription>Add one to see it show up here.</EmptyDescription>
        </Empty>
      ) : (
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Description</TableHead>
              <TableHead className={HEAD}>Category</TableHead>
              <TableHead className={HEAD}>Date</TableHead>
              <TableHead className={`${HEAD} text-right`}>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((expense) => (
              <TableRow key={expense.id} className="border-border/50">
                <TableCell className="px-0 py-3 font-medium">{expense.description}</TableCell>
                <TableCell className="px-0 py-3">
                  {expense.category_id ? (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-primary">
                      {categoryNameById.get(expense.category_id) ?? "Category"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-0 py-3 text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </TableCell>
                <TableCell className="px-0 py-3 text-right font-medium">
                  {Number(expense.amount).toLocaleString(undefined, {
                    style: "currency",
                    currency: expense.currency,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
