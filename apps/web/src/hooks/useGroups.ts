import { useQuery } from "@tanstack/react-query";
import { listGroups } from "@/lib/api/groups";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });
}
