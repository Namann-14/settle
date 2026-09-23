import { useQuery } from "@tanstack/react-query";
import { getGroupInsight, getSettlePlan } from "@/lib/api/ai";

// LLM-backed: keep results around and never refetch on focus. A write to
// expenses/settlements invalidates them (hooks/mutations/invalidate.ts).
const AI_QUERY = { staleTime: 10 * 60 * 1000, retry: 0, refetchOnWindowFocus: false } as const;

export function useGroupInsight(groupId: string) {
  return useQuery({
    queryKey: ["group-insight", groupId],
    queryFn: () => getGroupInsight(groupId),
    ...AI_QUERY,
  });
}

export function useSettlePlan(groupId?: string) {
  return useQuery({
    queryKey: ["settle-plan", groupId ?? "all"],
    queryFn: () => getSettlePlan(groupId),
    ...AI_QUERY,
  });
}
