import { useQuery } from "@tanstack/react-query";
import { listIncomes } from "@/lib/api/incomes";
import type { ListIncomesParams } from "@/types";

export function useIncomes(params?: ListIncomesParams) {
  return useQuery({ queryKey: ["incomes", params], queryFn: () => listIncomes(params) });
}
