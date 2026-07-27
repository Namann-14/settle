import { useQuery } from "@tanstack/react-query";
import { listExpenses } from "@/lib/api/expenses";
import type { ListExpensesParams } from "@/types";

export function useExpenses(params?: ListExpensesParams) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => listExpenses(params),
  });
}
