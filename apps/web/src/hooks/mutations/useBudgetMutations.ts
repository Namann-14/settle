import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBudget, upsertBudget } from "@/lib/api/budgets";
import type { UpsertBudgetPayload } from "@/types";
import { invalidateSpending } from "./invalidate";

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertBudgetPayload) => upsertBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      invalidateSpending(queryClient);
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      invalidateSpending(queryClient);
    },
  });
}
