import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateBalances } from "./invalidate";
import { updateExpense } from "@/lib/api/expenses";
import type { UpdateExpensePayload } from "@/types";

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpensePayload }) =>
      updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
      invalidateBalances(queryClient);
    },
  });
}
