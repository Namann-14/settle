"use client";

import { useMemo } from "react";
import { Receipt } from "lucide-react";

import { Badge } from "@settle/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@settle/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@settle/ui/components/empty";
import { Skeleton } from "@settle/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@settle/ui/components/table";

import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";

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
    <Card>
      <CardHeader>
        <CardTitle>Transaction history</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
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
            <EmptyDescription>
              Add one to see it show up here.
            </EmptyDescription>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    {expense.category_id ? (
                      <Badge variant="secondary">
                        {categoryNameById.get(expense.category_id) ?? "Category"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{expense.date}</TableCell>
                  <TableCell className="text-right">
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
      </CardContent>
    </Card>
  );
}
