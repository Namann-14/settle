import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateSpending } from "./invalidate";
import { deleteCategory } from "@/lib/api/categories";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      // Deleting uncategorizes its expenses and drops its budget.
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      invalidateSpending(queryClient);
    },
  });
}
