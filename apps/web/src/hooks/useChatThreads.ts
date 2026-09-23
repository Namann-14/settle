import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChatThread, listChatThreads } from "@/lib/api/chat";

export const CHAT_THREADS_KEY = ["chat-threads"] as const;

export function useChatThreads() {
  return useQuery({
    queryKey: CHAT_THREADS_KEY,
    queryFn: listChatThreads,
  });
}

export function useDeleteChatThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteChatThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_THREADS_KEY });
    },
  });
}
