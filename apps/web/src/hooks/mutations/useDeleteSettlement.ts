import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSettlement } from "@/lib/api/settlements";

export function useDeleteSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSettlement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settlements"],
      });
    },
  });
}
