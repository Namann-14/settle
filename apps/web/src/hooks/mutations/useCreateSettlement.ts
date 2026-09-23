import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateBalances } from "./invalidate";
import { createSettlement } from "@/lib/api/settlements";
import type { CreateSettlementPayload } from "@/types";

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSettlementPayload) => createSettlement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settlements"],
      });
      invalidateBalances(queryClient);
    },
  });
}
