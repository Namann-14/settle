import { useQuery } from "@tanstack/react-query";
import { listRecurring } from "@/lib/api/recurring";

export function useRecurring() {
  return useQuery({ queryKey: ["recurring"], queryFn: listRecurring });
}
