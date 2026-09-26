import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncome, deleteIncome, updateIncome } from "@/lib/api/incomes";
import type { CreateIncomePayload, UpdateIncomePayload } from "@/types";
import { invalidateSpending } from "./invalidate";

function useIncomeMutation<V>(fn: (vars: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      invalidateSpending(queryClient);
    },
  });
}

export const useCreateIncome = () => useIncomeMutation((data: CreateIncomePayload) => createIncome(data));

export const useUpdateIncome = () =>
  useIncomeMutation(({ id, data }: { id: string; data: UpdateIncomePayload }) => updateIncome(id, data));

export const useDeleteIncome = () => useIncomeMutation((id: string) => deleteIncome(id));
