import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTelegramLinkCode, unlinkTelegram } from "@/lib/api/users";

export function useCreateTelegramLinkCode() {
  return useMutation({ mutationFn: createTelegramLinkCode });
}

export function useUnlinkTelegram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
