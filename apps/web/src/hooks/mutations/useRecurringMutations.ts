import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRecurring,
  deleteRecurring,
  syncRecurring,
  updateRecurring,
} from "@/lib/api/recurring";
import { todayIso } from "@/lib/people";
import type { CreateRecurringPayload, UpdateRecurringPayload } from "@/types";
import { invalidateBalances } from "./invalidate";

function useRecurringMutation<V, R>(fn: (vars: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

/**
 * Creating a rule also syncs, so a rule that starts today (or earlier)
 * shows up in the ledger straight away.
 */
export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRecurringPayload) => {
      const rule = await createRecurring(data);
      const { created } = await syncRecurring(todayIso());
      return { rule, created };
    },
    onSuccess: ({ created }) => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      if (created > 0) invalidateBalances(queryClient);
    },
  });
}

export const useUpdateRecurring = () =>
  useRecurringMutation(({ id, data }: { id: string; data: UpdateRecurringPayload }) =>
    updateRecurring(id, data),
  );

export const useDeleteRecurring = () => useRecurringMutation((id: string) => deleteRecurring(id));

export function useRecurringSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncRecurring(todayIso()),
    onSuccess: ({ created }) => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      if (created > 0) invalidateBalances(queryClient);
    },
  });
}
