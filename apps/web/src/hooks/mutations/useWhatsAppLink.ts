import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWhatsAppLinkCode, unlinkWhatsApp } from "@/lib/api/users";

export function useCreateWhatsAppLinkCode() {
  return useMutation({ mutationFn: createWhatsAppLinkCode });
}

export function useUnlinkWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkWhatsApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
