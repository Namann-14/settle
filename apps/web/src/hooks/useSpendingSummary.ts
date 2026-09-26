import { useQuery } from "@tanstack/react-query";
import { getSpendingSummary } from "@/lib/api/spending";

/** `month` is YYYY-MM; omitted means the current month. */
export function useSpendingSummary(month?: string) {
  return useQuery({
    queryKey: ["spending-summary", month ?? "current"],
    queryFn: () => getSpendingSummary(month),
  });
}
