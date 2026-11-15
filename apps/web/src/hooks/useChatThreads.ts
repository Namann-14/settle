import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateBalances } from "@/hooks/mutations/invalidate";
import { deleteChatThread, listChatThreads, restoreChatCheckpoint } from "@/lib/api/chat";

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

// Restoring rolls back expenses the assistant added later in the chat, so
// everything derived from expenses is refreshed when any were removed.
export function useRestoreChatCheckpoint(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkpointId: string) => restoreChatCheckpoint(chatId, checkpointId),
    onSuccess: ({ removed_expenses }) => {
      queryClient.invalidateQueries({ queryKey: CHAT_THREADS_KEY });
      if (removed_expenses > 0) invalidateBalances(queryClient);
    },
  });
}
