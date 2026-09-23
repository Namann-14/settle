import { useMutation } from "@tanstack/react-query";
import { draftExpenseFromText, draftExpenseFromVoice } from "@/lib/api/ai";

export function useDraftExpenseFromText() {
  return useMutation({
    mutationFn: ({ text, groupId }: { text: string; groupId?: string | null }) =>
      draftExpenseFromText(text, groupId),
  });
}

export function useDraftExpenseFromVoice() {
  return useMutation({
    mutationFn: ({ audio, groupId }: { audio: Blob; groupId?: string | null }) =>
      draftExpenseFromVoice(audio, groupId),
  });
}
