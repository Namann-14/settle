import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettlement } from "@/lib/api/settlements";
import type { UpdateSettlementPayload } from "@/types";

export function useUpdateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSettlementPayload }) =>
      updateSettlement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settlements"],
      });
    },
  });
}
