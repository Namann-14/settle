import { useQuery } from "@tanstack/react-query";
import { listSettlements } from "@/lib/api/settlements";
import type { ListSettlementsParams } from "@/types";

export function useSettlements(params?: ListSettlementsParams) {
  return useQuery({
    queryKey: ["settlements", params],
    queryFn: () => listSettlements(params),
  });
}
