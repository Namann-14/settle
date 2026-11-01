import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateSpending } from "./invalidate";
import { updateCurrentUser } from "@/lib/api/users";

// Profile edits (today only the default currency, from Settings). Spending
// totals are reported in the default currency, so they are refreshed too.
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      invalidateSpending(queryClient);
    },
  });
}
