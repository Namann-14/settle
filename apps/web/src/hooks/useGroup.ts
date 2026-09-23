import { useQuery } from "@tanstack/react-query";
import { getGroup, getGroupBalances, listInvitations } from "@/lib/api/groups";

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => getGroup(id),
  });
}

export function useGroupBalances(id: string | undefined) {
  return useQuery({
    queryKey: ["group-balances", id],
    queryFn: () => getGroupBalances(id!),
    enabled: !!id,
  });
}

export function useGroupInvitations(id: string) {
  return useQuery({
    queryKey: ["group-invitations", id],
    queryFn: () => listInvitations(id),
  });
}
