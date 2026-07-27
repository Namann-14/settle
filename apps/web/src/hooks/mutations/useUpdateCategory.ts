import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}
