import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "@/lib/api/groups";

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
}
