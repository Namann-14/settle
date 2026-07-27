import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "@/lib/api/groups";
import type { CreateGroupPayload } from "@/types";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupPayload) => createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
}
