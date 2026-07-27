import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/lib/api/expenses";
import type { CreateExpensePayload } from "@/types";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpensePayload) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
  });
}
