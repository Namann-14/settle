import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateSpending } from "./invalidate";
import { updateCategory } from "@/lib/api/categories";
import type { UpdateCategoryPayload } from "@/types";

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      // Category names, icons and colors are baked into the spending summary.
      invalidateSpending(queryClient);
    },
  });
}
