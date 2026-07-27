import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroup } from "@/lib/api/groups";
import type { UpdateGroupPayload } from "@/types";

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupPayload }) =>
      updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
}
