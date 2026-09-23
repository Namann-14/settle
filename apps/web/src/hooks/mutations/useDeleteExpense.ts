import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateBalances } from "./invalidate";
import { deleteExpense } from "@/lib/api/expenses";

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
      invalidateBalances(queryClient);
    },
  });
}
