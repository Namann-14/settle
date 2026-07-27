import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/lib/api/categories";
import type { CreateCategoryPayload } from "@/types";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}
